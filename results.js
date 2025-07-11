document.addEventListener('DOMContentLoaded', () => {
    const matchupDisplay = document.getElementById('matchup-display');
    const mapNameLabel = document.getElementById('map-name-label');
    const mapImageDisplay = document.getElementById('map-image-display');
    const backToMainBtn = document.getElementById('back-to-main');

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
        finalBestCombinations.forEach((combination, index) => {
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
                        <h5 class="text-center text-primary">공격팀 (총점: ${scoreA})</h5>
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
                        <h5 class="text-center text-danger">수비팀 (총점: ${scoreB})</h5>
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
            `;
            matchupDisplay.appendChild(combinationDiv);
        });

    } else {
        matchupDisplay.innerHTML = '<p class="text-center">생성된 팀 결과가 없습니다. 메인 페이지로 돌아가 팀을 생성해주세요.</p>';
        mapNameLabel.textContent = '';
        mapImageDisplay.style.display = 'none';
    }

    // 뒤로가기 버튼 이벤트 리스너
    backToMainBtn.addEventListener('click', () => {
        window.history.back();
    });
});