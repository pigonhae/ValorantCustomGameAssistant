document.addEventListener('DOMContentLoaded', () => {
    const playerInputsDiv = document.getElementById('player-inputs');
    const mapSelectionDiv = document.getElementById('map-selection');
    const autoFillPlayersBtn = document.getElementById('auto-fill-players');
    const generateTeamsBtn = document.getElementById('generate-teams');
    const resultsSection = document.getElementById('results-section');
    const matchupDisplay = document.getElementById('matchup-display');
    const mapNameLabel = document.getElementById('map-name-label');
    const mapImageDisplay = document.getElementById('map-image-display');

    const maps = ["스플릿", "바인드", "헤이븐", "어센트", "아이스박스", "브리즈", "프랙처", "펄", "로터스", "선셋", "어비스", "코로드"];
    const playerInputFields = []; // This will now store objects with name, tier, and positions

    const TIERS = {
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

    const TIER_COLORS = {
        "아이언": "badge-iron",
        "브론즈": "badge-bronze",
        "실버": "badge-silver",
        "골드": "badge-gold",
        "플래티넘": "badge-platinum",
        "다이아몬드": "badge-diamond",
        "초월자": "badge-ascendant",        "불멸": "badge-immortal",
        "레디언트": "badge-radiant"
    };

    const POSITIONS = ["타격대", "척후대", "감시자", "전략가"];

    // --- 맵 선택 UI 업데이트 ---
    function updateMapGrayscale() {
        const allMapDivs = mapSelectionDiv.querySelectorAll('.map-image-container');
        allMapDivs.forEach(div => {
            if (div.classList.contains('selected')) {
                div.classList.remove('grayscale');
            } else {
                div.classList.add('grayscale');
            }
        });
    }

    // --- UI 초기화 ---
    function initializeUI() {
        // 플레이어 입력 필드 생성
        const playerFragment = document.createDocumentFragment();
        for (let i = 0; i < 10; i++) { // 10 players total
            const playerDiv = document.createElement('div');
            playerDiv.className = 'player-input-group mb-3 p-2 border rounded'; // Added styling classes
            playerDiv.innerHTML = `
                <div class="d-flex align-items-center mb-2">
                    <input type="text" class="form-control player-name-input" placeholder="플레이어 ${i + 1}">
                </div>
                <div class="d-flex align-items-center mb-2">
                    <label class="form-label me-2 mb-0">티어:</label>
                    <select class="form-select player-tier-select flex-grow-1 form-select-sm">
                        ${Object.keys(TIERS).map(tier => `<option value="${tier}">${tier}</option>`).join('')}
                    </select>
                </div>
                <div class="player-positions-checkboxes">
                    <div class="d-flex align-items-center mb-1">
                        <label class="form-label me-2 mb-0">포지션:</label>
                    </div>
                    <div class="d-flex flex-wrap">
                        ${POSITIONS.map(pos => `
                            <div class="form-check me-2 mb-1">
                                <input class="form-check-input player-position-checkbox" type="checkbox" value="${pos}" id="player-${i}-pos-${pos}">
                                <label class="form-check-label" for="player-${i}-pos-${pos}">${pos}</label>
                            </div>
                        `).join('')}
                        <div class="form-check me-2 mb-1"> <!-- Moved and class changed -->
                            <input class="form-check-input select-all-positions" type="checkbox" id="player-${i}-select-all">
                            <label class="form-check-label" for="player-${i}-select-all">모두 체크</label>
                        </div>
                    </div>
                </div>
            `;
            playerFragment.appendChild(playerDiv);
        }
        playerInputsDiv.appendChild(playerFragment);

        // playerInputFields 배열 채우기 (각 플레이어 그룹의 요소들을 참조)
        for (let i = 0; i < 10; i++) {
            const playerGroup = playerInputsDiv.children[i];
            playerInputFields.push({
                nameInput: playerGroup.querySelector('.player-name-input'),
                tierSelect: playerGroup.querySelector('.player-tier-select'),
                positionCheckboxes: Array.from(playerGroup.querySelectorAll('.player-position-checkbox'))
            });
        }

        // '하성' 또는 '피곤해' 이름 자동 완성 기능
        playerInputFields.forEach(player => {
            player.nameInput.addEventListener('input', () => {
                const name = player.nameInput.value.trim();
                if (name === '하성' || name === '피곤해') {
                    player.tierSelect.value = '실버 1';
                    const positionsToSelect = ['타격대', '감시자', '전략가'];
                    player.positionCheckboxes.forEach(checkbox => {
                        checkbox.checked = positionsToSelect.includes(checkbox.value);
                    });
                }
            });
        });

        // 맵 이미지 생성
        const mapFragment = document.createDocumentFragment();
        maps.forEach(mapName => {
            const mapDiv = document.createElement('div');
            mapDiv.className = 'map-image-container selected'; // Default to selected
            mapDiv.dataset.mapName = mapName; // Store map name in data attribute
            mapDiv.innerHTML = `
                <img src="images/${mapName}.png" alt="${mapName}" class="img-fluid map-thumbnail">
                <div class="map-name-overlay">${mapName}</div>
            `;
            mapDiv.addEventListener('click', () => {
                mapDiv.classList.toggle('selected');
                updateMapGrayscale();
            });
            mapFragment.appendChild(mapDiv);
        });
        mapSelectionDiv.appendChild(mapFragment);

        // 포지션 체크박스 선택 제한 로직
        playerInputFields.forEach((player, playerIndex) => {
            player.positionCheckboxes.forEach(checkbox => {
                checkbox.addEventListener('change', () => {
                    const checkedCount = player.positionCheckboxes.filter(cb => cb.checked).length;
                    if (checkedCount > 4) {
                        alert('포지션은 최대 4개까지 선택할 수 있습니다.');
                        checkbox.checked = false; // Uncheck the last selected one
                    }
                });
            });
        });

        updateMapGrayscale(); // 초기 맵 상태 업데이트
    }

    // --- 이벤트 리스너 ---
    autoFillPlayersBtn.addEventListener('click', () => {
        const tierKeys = Object.keys(TIERS);
        playerInputFields.forEach((player, index) => {
            player.nameInput.value = `플레이어 ${index + 1}`;

            // Random Tier
            const randomTierIndex = Math.floor(Math.random() * tierKeys.length);
            player.tierSelect.value = tierKeys[randomTierIndex];

            // Random Positions (1 to 4 selected)
            player.positionCheckboxes.forEach(cb => cb.checked = false); // Uncheck all first
            const numPositionsToSelect = Math.floor(Math.random() * 4) + 1; // 1 to 4 positions
            const shuffledPositions = [...POSITIONS].sort(() => Math.random() - 0.5);
            for (let i = 0; i < numPositionsToSelect; i++) {
                const posValue = shuffledPositions[i];
                const checkbox = player.positionCheckboxes.find(cb => cb.value === posValue);
                if (checkbox) {
                    checkbox.checked = true;
                }
            }
        });
    });

    // "모두 체크" 체크박스 이벤트 리스너
    playerInputsDiv.addEventListener('change', (event) => {
        if (event.target.classList.contains('select-all-positions')) {
            const playerGroup = event.target.closest('.player-input-group');
            const checkboxes = playerGroup.querySelectorAll('.player-position-checkbox');
            checkboxes.forEach(cb => cb.checked = event.target.checked);
        }
    });

    generateTeamsBtn.addEventListener('click', () => {
        resultsSection.style.display = 'none'; // 이전 결과 숨기기
        matchupDisplay.innerHTML = ''; // 이전 매치업 초기화
        mapImageDisplay.src = ''; // 이전 맵 이미지 초기화
        mapNameLabel.textContent = ''; // 이전 맵 이름 초기화

        const players = [];
        let allPlayersValid = true;
        playerInputFields.forEach((playerGroup, index) => {
            const name = playerGroup.nameInput.value.trim();
            const tier = playerGroup.tierSelect.value;
            const score = TIERS[tier];
            const positions = playerGroup.positionCheckboxes
                                .filter(cb => cb.checked)
                                .map(cb => cb.value);

            if (name === '') {
                alert(`플레이어 ${index + 1}의 이름을 입력해주세요.`);
                allPlayersValid = false;
                return;
            }
            if (positions.length === 0) {
                alert(`플레이어 ${index + 1}의 포지션을 1개 이상 선택해주세요.`);
                allPlayersValid = false;
                return;
            }

            players.push({ name, tier, score, positions });
        });

        if (!allPlayersValid || players.length !== 10) {
            return;
        }

        const selectedMaps = Array.from(document.querySelectorAll('.map-image-container.selected')).map(div => div.dataset.mapName);
        if (selectedMaps.length === 0) {
            alert('플레이할 맵이 하나 이상 있어야 합니다.');
            return;
        }

        // --- 팀 밸런싱 로직 시작 ---
        const numCombinationsToGenerate = 3; // 최종적으로 생성할 조합의 수
        const candidatePoolSize = 500; // 생성할 후보 조합의 수 (이 값을 늘리면 더 다양한 조합을 찾을 수 있지만, 계산 시간이 길어질 수 있습니다.)
        const shufflesPerCandidate = 2000; // 각 후보 조합을 찾기 위한 셔플 횟수 (이 값을 늘리면 각 후보 조합의 밸런스가 더 좋아질 수 있습니다.)

        const candidateCombinations = [];

        for (let k = 0; k < candidatePoolSize; k++) {
            let bestTeamA = [];
            let bestTeamB = [];
            let minScoreDiff = Infinity;
            let bestPositionBalanceScore = Infinity;

            for (let i = 0; i < shufflesPerCandidate; i++) {
                const shuffledPlayers = [...players].sort(() => Math.random() - 0.5);
                const currentTeamA = shuffledPlayers.slice(0, 5);
                const currentTeamB = shuffledPlayers.slice(5, 10);

                const scoreA = currentTeamA.reduce((sum, p) => sum + p.score, 0);
                const scoreB = currentTeamB.reduce((sum, p) => sum + p.score, 0);
                const scoreDiff = Math.abs(scoreA - scoreB);

                const positionBalanceScore = calculatePositionBalance(currentTeamA, currentTeamB);

                // 점수 차이를 우선하고, 점수 차이가 같으면 포지션 밸런스를 우선
                if (scoreDiff < minScoreDiff || (scoreDiff === minScoreDiff && positionBalanceScore < bestPositionBalanceScore)) {
                    minScoreDiff = scoreDiff;
                    bestTeamA = currentTeamA;
                    bestTeamB = currentTeamB;
                    bestPositionBalanceScore = positionBalanceScore;
                }
            }
            candidateCombinations.push({ teamA: bestTeamA, teamB: bestTeamB, scoreDiff: minScoreDiff, positionBalanceScore: bestPositionBalanceScore });
        }

        // 후보 조합들을 점수 차이, 그 다음 포지션 밸런스 점수 기준으로 정렬
        candidateCombinations.sort((a, b) => {
            if (a.scoreDiff !== b.scoreDiff) {
                return a.scoreDiff - b.scoreDiff;
            }
            return a.positionBalanceScore - b.positionBalanceScore;
        });

        const finalBestCombinations = [];
        const seenCombinations = new Set(); // 고유 조합을 저장하기 위한 Set

        for (const combo of candidateCombinations) {
            if (finalBestCombinations.length >= numCombinationsToGenerate) {
                break; // 필요한 수의 고유 조합을 찾았으면 중단
            }

            // 조합의 정규화된 문자열 표현 생성 (팀 순서에 상관없이 동일하게)
            const teamA_names = combo.teamA.map(p => p.name).sort().join(',');
            const teamB_names = combo.teamB.map(p => p.name).sort().join(',');
            const canonicalCombo = [teamA_names, teamB_names].sort().join('|');

            if (!seenCombinations.has(canonicalCombo)) {
                finalBestCombinations.push(combo);
                seenCombinations.add(canonicalCombo);
            }
        }

        // 결과 표시를 위해 bestCombinations 대신 finalBestCombinations 사용
        // (이 부분은 아래 결과 표시 로직에서 변수명만 변경하면 됨)

        // --- 팀 밸런싱 로직 끝 ---

        // 맵 랜덤 선정 및 이미지 표시
        const selectedMap = selectedMaps[Math.floor(Math.random() * selectedMaps.length)];
        mapNameLabel.textContent = `🗺️ 이번 매치 맵: ${selectedMap}`;

        const imagePath = `images/${selectedMap}.png`;
        mapImageDisplay.src = imagePath;
        mapImageDisplay.alt = `${selectedMap} 맵 이미지`;

        mapImageDisplay.onerror = () => {
            console.error(`Failed to load image: ${imagePath}`);
            mapImageDisplay.src = '';
            mapImageDisplay.alt = '이미지를 불러올 수 없습니다.';
        };

        // 결과 표시
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
                                const baseTier = p.tier.split(' ')[0]; // e.g., "아이언 1" -> "아이언"
                                const tierColorClass = TIER_COLORS[baseTier] || 'badge-secondary';
                                return `<li class="list-group-item d-flex justify-content-between align-items-center">
                                ${p.name} <span class="badge ${tierColorClass}">${p.tier} (${p.score})</span>
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
                                return `<li class="list-group-item d-flex justify-content-between align-items-center">
                                ${p.name} <span class="badge ${tierColorClass}">${p.tier} (${p.score})</span>
                            </li>`;
                            }).join('')}
                    </div>
                </div>
                <p class="text-center mt-3 mb-0">점수 차이: ${Math.abs(scoreA - scoreB)}</p>
            `;
            matchupDisplay.appendChild(combinationDiv);
        });

        resultsSection.style.display = 'block'; // 결과 섹션 표시
    });

    // 포지션 밸런스 계산 함수 (간단한 예시)
    function calculatePositionBalance(teamA, teamB) {
        const teamAPosCounts = {};
        const teamBPosCounts = {};
        POSITIONS.forEach(pos => {
            teamAPosCounts[pos] = 0;
            teamBPosCounts[pos] = 0;
        });

        teamA.forEach(player => {
            player.positions.forEach(pos => {
                if (teamAPosCounts[pos] !== undefined) teamAPosCounts[pos]++;
            });
        });
        teamB.forEach(player => {
            player.positions.forEach(pos => {
                if (teamBPosCounts[pos] !== undefined) teamBPosCounts[pos]++;
            });
        });

        let balanceScore = 0;
        POSITIONS.forEach(pos => {
            balanceScore += Math.abs(teamAPosCounts[pos] - teamBPosCounts[pos]);
        });
        return balanceScore;
    }

    // UI 초기화 함수 호출
    initializeUI();
});
