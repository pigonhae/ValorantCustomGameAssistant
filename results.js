document.addEventListener('DOMContentLoaded', () => {
    const matchupDisplay = document.getElementById('matchup-display');
    const mapNameLabel = document.getElementById('map-name-label');
    const mapImageDisplay = document.getElementById('map-image-display');
    const backToMainBtn = document.getElementById('back-to-main');
    const helpIcon = document.getElementById('help-icon');
    const copyToast = document.getElementById('copy-toast');
    const tierInfoModal = document.getElementById('tier-info-modal');
    const modalCloseBtn = document.getElementById('modal-close-btn');
    const tierInfoBody = document.getElementById('tier-info-body');

    const TIER_COLORS = {
        "아이언": "badge-iron",
        "브론즈": "badge-bronze",
        "실버": "badge-silver",
        "골드": "badge-gold",
        "플래티넘": "badge-platinum",
        "다이아몬드": "badge-diamond",
        "초월자": "badge-ascendant",
        "불멸": "badge-immortal",
        "레디언트": "badge-radiant"
    };

    /**
     * 클립보드 복사 성공 팝업을 표시합니다.
     */
    function showCopyToast() {
        copyToast.classList.add('show');
        setTimeout(() => {
            copyToast.classList.remove('show');
        }, 2000); // 2초 후에 팝업 숨기기
    }

    const TIER_HEX_COLORS = {
        "아이언": "#36454F",
        "브론즈": "#A52A2A",
        "실버": "#D3D3D3",
        "골드": "#FFD700",
        "플래티넘": "#87CEEB",
        "다이아몬드": "#DDA0DD",
        "초월자": "#008000",
        "불멸": "#FF0000",
        "레디언트": "#FFC107"
    };

    const TIER_SCORES = {
        "아이언 1": 100,
        "아이언 2": 110,
        "아이언 3": 120,
        "브론즈 1": 135,
        "브론즈 2": 150,
        "브론즈 3": 165,
        "실버 1": 185,
        "실버 2": 205,
        "실버 3": 225,
        "골드 1": 250,
        "골드 2": 275,
        "골드 3": 300,
        "플래티넘 1": 330,
        "플래티넘 2": 360,
        "플래티넘 3": 390,
        "다이아몬드 1": 430,
        "다이아몬드 2": 470,
        "다이아몬드 3": 510,
        "초월자 1": 560,
        "초월자 2": 610,
        "초월자 3": 660,
        "불멸 1": 720,
        "불멸 2": 780,
        "불멸 3": 840,
        "레디언트": 1000
    };

    /**
     * 전체 티어 이름을 약어로 변환합니다. (예: "브론즈 2" -> "B2")
     * @param {string} tier - 전체 티어 이름
     * @returns {string} - 변환된 티어 약어
     */
    function getTierAbbreviation(tier) {
        const parts = tier.split(' ');
        const tierName = parts[0];
        const tierNum = parts[1] || '';

        let abbrev = '';
        switch (tierName) {
            case '아이언': abbrev = 'I'; break;
            case '브론즈': abbrev = 'B'; break;
            case '실버': abbrev = 'S'; break;
            case '골드': abbrev = 'G'; break;
            case '플래티넘': abbrev = 'P'; break;
            case '다이아몬드': abbrev = 'D'; break;
            case '초월자': abbrev = 'A'; break;
            case '불멸': abbrev = 'IM'; break;
            case '레디언트': return 'R';
            default: return '';
        }
        return abbrev + tierNum;
    }

    // sessionStorage에서 결과 데이터 가져오기
    const resultsData = JSON.parse(sessionStorage.getItem('valorantTeamResults'));

    if (resultsData) {
        const { finalBestCombinations, selectedMap } = resultsData;

        // 이전 결과 초기화
        matchupDisplay.innerHTML = '';

        // 맵 정보 표시
        mapNameLabel.textContent = `🗺️ 이번 매치 맵: ${selectedMap}`;
        const imagePath = `images/map/${selectedMap}.png`;
        mapImageDisplay.src = imagePath;
        mapImageDisplay.alt = `${selectedMap} 맵 이미지`;
        mapImageDisplay.onerror = () => {
            console.error(`Failed to load image: ${imagePath}`);
            mapImageDisplay.src = '';
            mapImageDisplay.alt = '이미지를 불러올 수 없습니다.';
        };

        // 팀 조합 결과 표시
        finalBestCombinations.slice(0, 3).forEach((combination, index) => {
            const teamA = combination.teamA.sort((a, b) => b.score - a.score);
            const teamB = combination.teamB.sort((a, b) => b.score - a.score);
            const scoreA = teamA.reduce((sum, p) => sum + p.score, 0);
            const scoreB = teamB.reduce((sum, p) => sum + p.score, 0);

            const combinationDiv = document.createElement('div');
            combinationDiv.className = 'team-combination-result mb-4 p-3 border rounded';
            combinationDiv.innerHTML = `
                <h4 class="text-center mb-3">조합 ${index + 1}</h4>
                <div class="row">
                    <div class="col-md-6">
                        <h5 class="text-center text-primary">공격팀 (${scoreA})</h5>
                        <ul class="list-group">
                            ${teamA.map(p => {
                                const baseTier = p.tier.split(' ')[0];
                                const tierColorClass = TIER_COLORS[baseTier] || 'badge-secondary';
                                const abbreviatedTier = getTierAbbreviation(p.tier);
                                const positionLogos = p.positions.map(pos => 
                                    `<span class="position-logo-wrapper" title="${pos}">
                                        <img src="images/class/${pos}.png" alt="${pos}" class="position-logo">
                                    </span>`
                                ).join('');
                                return `<li class="list-group-item ${tierColorClass}">
                                    <span class="player-tier-abbrev">${abbreviatedTier}</span>
                                    <div class="player-details">
                                        <span class="player-name">${p.name}</span>
                                        <div class="position-logos-container mt-1">${positionLogos}</div>
                                    </div>
                                </li>`;
                            }).join('')}
                        </ul>
                    </div>
                    <div class="col-md-6">
                        <h5 class="text-center text-danger">수비팀 (${scoreB})</h5>
                        <ul class="list-group">
                            ${teamB.map(p => {
                                const baseTier = p.tier.split(' ')[0];
                                const tierColorClass = TIER_COLORS[baseTier] || 'badge-secondary';
                                const abbreviatedTier = getTierAbbreviation(p.tier);
                                const positionLogos = p.positions.map(pos => 
                                    `<span class="position-logo-wrapper" title="${pos}">
                                        <img src="images/class/${pos}.png" alt="${pos}" class="position-logo">
                                    </span>`
                                ).join('');
                                return `<li class="list-group-item ${tierColorClass}">
                                    <span class="player-tier-abbrev">${abbreviatedTier}</span>
                                    <div class="player-details">
                                        <span class="player-name">${p.name}</span>
                                        <div class="position-logos-container mt-1">${positionLogos}</div>
                                    </div>
                                </li>`;
                            }).join('')}
                        </ul>
                    </div>
                </div>
                <p class="text-center mt-3 mb-0">점수 차이: ${Math.abs(scoreA - scoreB)}</p>
                <div class="text-center mt-3">
                    <button class="btn btn-outline-secondary btn-sm copy-combination-btn">결과 복사하기</button>
                </div>
            `;
            matchupDisplay.appendChild(combinationDiv);

            // 복사 버튼에 이벤트 리스너 추가
            const copyBtn = combinationDiv.querySelector('.copy-combination-btn');
            copyBtn.addEventListener('click', () => {
                const teamANames = teamA.map(p => p.name).join(', ');
                const teamBNames = teamB.map(p => p.name).join(', ');
                
                const copyText = `공격팀 : ${teamANames}\n수비팀 : ${teamBNames}\n\n이번 매치 맵 : ${selectedMap}`;

                navigator.clipboard.writeText(copyText).then(() => {
                    showCopyToast();
                }).catch(err => {
                    console.error('클립보드 복사 실패:', err);
                    alert('복사에 실패했습니다. 다시 시도해주세요.');
                });
            });
        });

    } else {
        matchupDisplay.innerHTML = '<p class="text-center">생성된 팀 결과가 없습니다. 메인 페이지로 돌아가 팀을 생성해주세요.</p>';
        mapNameLabel.textContent = '';
        mapImageDisplay.style.display = 'none';
    }

    // Populate tier info modal
    const tierList = document.createElement('ul');
    tierList.className = 'tier-info-list';

    for (const tier in TIER_SCORES) {
        const tierName = tier.split(' ')[0];
        const item = document.createElement('li');
        item.className = 'tier-info-item';
        
        item.innerHTML = `
            <div class="tier-color-swatch" style="background-color: ${TIER_HEX_COLORS[tierName] || '#ccc'};"></div>
            <span class="tier-info-name">${tier}</span>
            <span class="tier-info-score">${TIER_SCORES[tier]} 점</span>
        `;
        tierList.appendChild(item);
    }
    tierInfoBody.appendChild(tierList);

    // Event listeners for modal
    helpIcon.addEventListener('click', () => {
        tierInfoModal.classList.add('show');
    });

    modalCloseBtn.addEventListener('click', () => {
        tierInfoModal.classList.remove('show');
    });

    tierInfoModal.addEventListener('click', (event) => {
        if (event.target === tierInfoModal) { // Click on overlay
            tierInfoModal.classList.remove('show');
        }
    });

    // 뒤로가기 버튼 이벤트 리스너
    backToMainBtn.addEventListener('click', () => {
        window.history.back();
    });
});