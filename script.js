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
    const playerInputFields = [];

    // --- UI 초기화 ---
    function initializeUI() {
        // 플레이어 입력 필드 생성
        for (let i = 0; i < 5; i++) {
            const groupDiv = document.createElement('div');
            groupDiv.className = 'input-group mb-2';
            groupDiv.innerHTML = `
                <span class="input-group-text">그룹 ${i + 1}</span>
                <input type="text" class="form-control player-input" placeholder="플레이어 ${i * 2 + 1}">
                <input type="text" class="form-control player-input" placeholder="플레이어 ${i * 2 + 2}">
            `;
            playerInputsDiv.appendChild(groupDiv);
            playerInputFields.push(groupDiv.querySelectorAll('.player-input'));
        }

        // 맵 체크박스 생성
        maps.forEach(mapName => {
            const formCheckDiv = document.createElement('div');
            formCheckDiv.className = 'form-check';
            formCheckDiv.innerHTML = `
                <input class="form-check-input map-checkbox" type="checkbox" value="${mapName}" id="map-${mapName}" checked>
                <label class="form-check-label" for="map-${mapName}">${mapName}</label>
            `;
            mapSelectionDiv.appendChild(formCheckDiv);
        });
    }

    // --- 이벤트 리스너 ---
    autoFillPlayersBtn.addEventListener('click', () => {
        playerInputFields.forEach((group, groupIndex) => {
            group[0].value = `플레이어 ${groupIndex * 2 + 1}`;
            group[1].value = `플레이어 ${groupIndex * 2 + 2}`;
        });
    });

    generateTeamsBtn.addEventListener('click', () => {
        resultsSection.style.display = 'none'; // 이전 결과 숨기기
        matchupDisplay.innerHTML = ''; // 이전 매치업 초기화
        mapImageDisplay.src = ''; // 이전 맵 이미지 초기화
        mapNameLabel.textContent = ''; // 이전 맵 이름 초기화

        const allPlayers = [];
        playerInputFields.forEach(group => {
            allPlayers.push(group[0].value.trim());
            allPlayers.push(group[1].value.trim());
        });

        // 플레이어 유효성 검사
        if (allPlayers.some(p => p === '') || allPlayers.length !== 10) {
            alert('10명의 플레이어 이름을 모두 입력해주세요.');
            return;
        }

        const selectedMaps = Array.from(document.querySelectorAll('.map-checkbox:checked')).map(cb => cb.value);
        if (selectedMaps.length === 0) {
            alert('플레이할 맵이 하나 이상 있어야 합니다.');
            return;
        }

        // 팀 밸런싱 로직 (Python 코드와 유사하게)
        const pairs = [];
        for (let i = 0; i < 10; i += 2) {
            pairs.push([allPlayers[i], allPlayers[i + 1]]);
        }

        // 각 페어 내에서 랜덤하게 순서 섞기
        const finalMatchups = pairs.map(pair => {
            const shuffledPair = [...pair].sort(() => Math.random() - 0.5);
            return shuffledPair;
        });

        

        const leftTeam = [];
        const rightTeam = [];
        finalMatchups.forEach(pair => {
            leftTeam.push(pair[0]);
            rightTeam.push(pair[1]);
        });

        // 공격/수비팀 고정 배정 (왼쪽팀: 공격팀, 오른쪽팀: 수비팀)
        const sideForLeftTeam = '공격팀';
        const sideForRightTeam = '수비팀';

        // 팀별 플레이어를 매치업 상단에 한 줄로 표시
        const combinedTeamHeader = document.createElement('h5');
        combinedTeamHeader.className = 'text-center mb-3'; // Adjusted margin-bottom
        combinedTeamHeader.textContent = `${sideForLeftTeam} / ${sideForRightTeam}`;
        matchupDisplay.appendChild(combinedTeamHeader);

        // 매치업 표시
        finalMatchups.forEach(pair => {
            const matchupDiv = document.createElement('div');
            matchupDiv.className = 'text-center mb-2'; // Add text-center and margin-bottom
            matchupDiv.innerHTML = `
                <p class="mb-0"><span class="player-name">${pair[0]}</span> <span class="vs-text">vs</span> <span class="player-name">${pair[1]}</span></p>
            `;
            matchupDisplay.appendChild(matchupDiv);
        });

        // 맵 랜덤 선정 및 이미지 표시 (매치업 아래로 이동)
        const selectedMap = selectedMaps[Math.floor(Math.random() * selectedMaps.length)];
        mapNameLabel.textContent = `🗺️ 이번 매치 맵: ${selectedMap}`;

        // 이미지 로드 (images 폴더에 맵이름.png 파일이 있다고 가정)
        const imagePath = `images/${selectedMap}.png`; // Assuming all are .png now
        mapImageDisplay.src = imagePath;
        mapImageDisplay.alt = `${selectedMap} 맵 이미지`;

        // 이미지 로드 실패 시 처리 (선택 사항)
        mapImageDisplay.onerror = () => {
            console.error(`Failed to load image: ${imagePath}`);
            mapImageDisplay.src = ''; // 이미지 제거
            mapImageDisplay.alt = '이미지를 불러올 수 없습니다.';
        };

        resultsSection.style.display = 'block'; // 결과 섹션 표시
    });

    // UI 초기화 함수 호출
    initializeUI();
});