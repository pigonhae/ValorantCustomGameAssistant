document.addEventListener('DOMContentLoaded', () => {
    const playerInputsDiv = document.getElementById('player-inputs');
    const mapSelectionDiv = document.getElementById('map-selection');
    const autoFillPlayersBtn = document.getElementById('auto-fill-players');
    const generateTeamsBtn = document.getElementById('generate-teams');

    const maps = ["스플릿", "바인드", "헤이븐", "어센트", "아이스박스", "브리즈", "프랙처", "펄", "로터스", "선셋", "어비스", "코로드"];
    const playerInputFields = [];

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

    const POSITIONS = ["타격대", "척후대", "감시자", "전략가"];

    // --- 데이터 저장 및 복원 --- 
    function saveInputs() {
        const inputs = {
            players: [],
            selectedMaps: []
        };

        playerInputFields.forEach(playerGroup => {
            const name = playerGroup.nameInput.value.trim();
            const tier = playerGroup.tierSelect.value;
            const positions = playerGroup.positionCheckboxes
                                .filter(cb => cb.checked)
                                .map(cb => cb.value);
            inputs.players.push({ name, tier, positions });
        });

        inputs.selectedMaps = Array.from(document.querySelectorAll('.map-image-container.selected')).map(div => div.dataset.mapName);

        sessionStorage.setItem('valorantTeamInputs', JSON.stringify(inputs));
    }

    function loadInputs() {
        const savedInputs = JSON.parse(sessionStorage.getItem('valorantTeamInputs'));
        if (!savedInputs) return;

        // 플레이어 정보 복원
        savedInputs.players.forEach((playerData, index) => {
            if (playerInputFields[index]) {
                const playerGroup = playerInputFields[index];
                playerGroup.nameInput.value = playerData.name || '';
                playerGroup.tierSelect.value = playerData.tier || Object.keys(TIERS)[0];
                playerGroup.positionCheckboxes.forEach(cb => {
                    cb.checked = playerData.positions.includes(cb.value);
                });
            }
        });

        // 맵 선택 정보 복원
        const allMapDivs = mapSelectionDiv.querySelectorAll('.map-image-container');
        allMapDivs.forEach(div => {
            if (savedInputs.selectedMaps.includes(div.dataset.mapName)) {
                div.classList.add('selected');
            } else {
                div.classList.remove('selected');
            }
        });
        updateMapGrayscale();
    }

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
        const playerFragment = document.createDocumentFragment();
        for (let i = 0; i < 10; i++) {
            const playerDiv = document.createElement('div');
            playerDiv.className = 'player-input-group mb-3 p-2 border rounded';
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
                        <div class="form-check me-2 mb-1">
                            <input class="form-check-input select-all-positions" type="checkbox" id="player-${i}-select-all">
                            <label class="form-check-label" for="player-${i}-select-all">모두 체크</label>
                        </div>
                    </div>
                </div>
            `;
            playerFragment.appendChild(playerDiv);
        }
        playerInputsDiv.appendChild(playerFragment);

        for (let i = 0; i < 10; i++) {
            const playerGroup = playerInputsDiv.children[i];
            playerInputFields.push({
                nameInput: playerGroup.querySelector('.player-name-input'),
                tierSelect: playerGroup.querySelector('.player-tier-select'),
                positionCheckboxes: Array.from(playerGroup.querySelectorAll('.player-position-checkbox'))
            });
        }

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

        const mapFragment = document.createDocumentFragment();
        maps.forEach(mapName => {
            const mapDiv = document.createElement('div');
            mapDiv.className = 'map-image-container selected';
            mapDiv.dataset.mapName = mapName;
            mapDiv.innerHTML = `
                <img src="images/map/${mapName}.png" alt="${mapName}" class="img-fluid map-thumbnail">
                <div class="map-name-overlay">${mapName}</div>
            `;
            mapDiv.addEventListener('click', () => {
                mapDiv.classList.toggle('selected');
                updateMapGrayscale();
            });
            mapFragment.appendChild(mapDiv);
        });
        mapSelectionDiv.appendChild(mapFragment);

        playerInputFields.forEach((player) => {
            player.positionCheckboxes.forEach(checkbox => {
                checkbox.addEventListener('change', () => {
                    const checkedCount = player.positionCheckboxes.filter(cb => cb.checked).length;
                    if (checkedCount > 4) {
                        alert('포지션은 최대 4개까지 선택할 수 있습니다.');
                        checkbox.checked = false;
                    }
                });
            });
        });

        updateMapGrayscale();
        loadInputs(); // 페이지 로드 시 저장된 데이터 복원
    }

    // --- 이벤트 리스너 ---
    autoFillPlayersBtn.addEventListener('click', () => {
        const tierKeys = Object.keys(TIERS);
        playerInputFields.forEach((player, index) => {
            player.nameInput.value = `플레이어 ${index + 1}`;
            const randomTierIndex = Math.floor(Math.random() * tierKeys.length);
            player.tierSelect.value = tierKeys[randomTierIndex];
            player.positionCheckboxes.forEach(cb => cb.checked = false);
            const numPositionsToSelect = Math.floor(Math.random() * 4) + 1;
            const shuffledPositions = [...POSITIONS].sort(() => Math.random() - 0.5);
            for (let i = 0; i < numPositionsToSelect; i++) {
                const posValue = shuffledPositions[i];
                const checkbox = player.positionCheckboxes.find(cb => cb.value === posValue);
                if (checkbox) checkbox.checked = true;
            }
        });
    });

    playerInputsDiv.addEventListener('change', (event) => {
        if (event.target.classList.contains('select-all-positions')) {
            const playerGroup = event.target.closest('.player-input-group');
            const checkboxes = playerGroup.querySelectorAll('.player-position-checkbox');
            checkboxes.forEach(cb => cb.checked = event.target.checked);
        }
    });

    generateTeamsBtn.addEventListener('click', () => {
        saveInputs(); // 결과 생성 전 현재 입력 상태 저장

        const players = [];
        let allPlayersValid = true;
        playerInputFields.forEach((playerGroup, index) => {
            const name = playerGroup.nameInput.value.trim();
            const tier = playerGroup.tierSelect.value;
            const score = TIERS[tier];
            const positions = playerGroup.positionCheckboxes.filter(cb => cb.checked).map(cb => cb.value);

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

        if (!allPlayersValid || players.length !== 10) return;

        const selectedMaps = Array.from(document.querySelectorAll('.map-image-container.selected')).map(div => div.dataset.mapName);
        if (selectedMaps.length === 0) {
            alert('플레이할 맵이 하나 이상 있어야 합니다.');
            return;
        }

        // --- 팀 밸런싱 로직 ---
        function findBestCombination(players, excludedCombinations) {
            const shuffles = 20000;
            let bestCombo = null;
            let minScoreDiff = Infinity;
            let bestPositionBalanceScore = Infinity;

            for (let i = 0; i < shuffles; i++) {
                const shuffledPlayers = [...players].sort(() => Math.random() - 0.5);
                const teamA = shuffledPlayers.slice(0, 5);
                const teamB = shuffledPlayers.slice(5, 10);
                const teamA_names = teamA.map(p => p.name).sort().join(',');
                const teamB_names = teamB.map(p => p.name).sort().join(',');
                const canonicalCombo = [teamA_names, teamB_names].sort().join('|');

                if (excludedCombinations.has(canonicalCombo)) continue;

                const scoreA = teamA.reduce((sum, p) => sum + p.score, 0);
                const scoreB = teamB.reduce((sum, p) => sum + p.score, 0);
                const scoreDiff = Math.abs(scoreA - scoreB);
                const positionBalanceScore = calculatePositionBalance(teamA, teamB);

                if (scoreDiff < minScoreDiff || (scoreDiff === minScoreDiff && positionBalanceScore < bestPositionBalanceScore)) {
                    minScoreDiff = scoreDiff;
                    bestPositionBalanceScore = positionBalanceScore;
                    bestCombo = { teamA, teamB, scoreDiff, positionBalanceScore };
                }
            }
            return bestCombo;
        }

        const numCombinationsToGenerate = 6; // 생성할 조합의 수
        const finalBestCombinations = [];
        const seenCombinations = new Set();
        for (let i = 0; i < numCombinationsToGenerate; i++) {
            const bestCombo = findBestCombination(players, seenCombinations);
            if (bestCombo) {
                finalBestCombinations.push(bestCombo);
                const teamA_names = bestCombo.teamA.map(p => p.name).sort().join(',');
                const teamB_names = bestCombo.teamB.map(p => p.name).sort().join(',');
                const canonicalCombo = [teamA_names, teamB_names].sort().join('|');
                seenCombinations.add(canonicalCombo);
            } else {
                break;
            }
        }

        // --- 결과 저장 및 페이지 이동 ---
        const selectedMap = selectedMaps[Math.floor(Math.random() * selectedMaps.length)];
        
        const resultsData = {
            finalBestCombinations,
            selectedMap
        };

        sessionStorage.setItem('valorantTeamResults', JSON.stringify(resultsData));
        window.location.href = 'results.html'; // 결과 페이지로 이동
    });

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

    initializeUI();
});
