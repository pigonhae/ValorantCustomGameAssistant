import random

# Old TIERS data
OLD_TIERS = {
    "아이언 1": 1, "아이언 2": 2, "아이언 3": 3,
    "브론즈 1": 4, "브론즈 2": 5, "브론즈 3": 6,
    "실버 1": 7, "실버 2": 8, "실버 3": 9,
    "골드 1": 10, "골드 2": 11, "골드 3": 12,
    "플래티넘 1": 13, "플래티넘 2": 14, "플래티넘 3": 15,
    "다이아몬드 1": 16, "다이아몬드 2": 17, "다이아몬드 3": 18,
    "초월자 1": 19, "초월자 2": 20, "초월자 3": 21,
    "불멸 1": 22, "불멸 2": 23, "불멸 3": 24,
    "레디언트": 27
}

# New TIERS data
NEW_TIERS = {
    "아이언 1": 100, "아이언 2": 110, "아이언 3": 120,
    "브론즈 1": 135, "브론즈 2": 150, "브론즈 3": 165,
    "실버 1": 185, "실버 2": 205, "실버 3": 225,
    "골드 1": 250, "골드 2": 275, "골드 3": 300,
    "플래티넘 1": 330, "플래티넘 2": 360, "플래티넘 3": 390,
    "다이아몬드 1": 430, "다이아몬드 2": 470, "다이아몬드 3": 510,
    "초월자 1": 560, "초월자 2": 610, "초월자 3": 660,
    "불멸 1": 720, "불멸 2": 780, "불멸 3": 840,
    "레디언트": 1000
}

ALL_TIERS = list(OLD_TIERS.keys()) # Both old and new tiers have the same keys

def generate_random_players(num_players, tiers_map):
    players = []
    for i in range(num_players):
        tier = random.choice(ALL_TIERS)
        score = tiers_map[tier]
        players.append({'name': f'Player {i+1}', 'tier': tier, 'score': score})
    return players

def calculate_best_score_diff(players, num_shuffles=2000):
    min_score_diff = float('inf')
    for _ in range(num_shuffles):
        random.shuffle(players)
        team_a = players[:5]
        team_b = players[5:]

        score_a = sum(p['score'] for p in team_a)
        score_b = sum(p['score'] for p in team_b)
        score_diff = abs(score_a - score_b)

        if score_diff < min_score_diff:
            min_score_diff = score_diff
    return min_score_diff

def run_simulation(tiers_data, num_simulations=10, num_players_per_sim=10, num_shuffles_per_sim=2000):
    results = []
    for i in range(num_simulations):
        players = generate_random_players(num_players_per_sim, tiers_data)
        best_diff = calculate_best_score_diff(players, num_shuffles_per_sim)
        results.append(best_diff)
    return results

print("--- 시뮬레이션 시작 ---")

# Run simulation for Old TIERS
old_results = run_simulation(OLD_TIERS)
print("\n--- 기존 점수 책정 방식 시뮬레이션 결과 (10회) ---")
print(f"개별 점수 차이: {old_results}")
print(f"평균 점수 차이: {sum(old_results) / len(old_results):.2f}")
print(f"최대 점수 차이: {max(old_results)}")
print(f"최소 점수 차이: {min(old_results)}")

# Run simulation for New TIERS
new_results = run_simulation(NEW_TIERS)
print("\n--- 새로운 점수 책정 방식 시뮬레이션 결과 (10회) ---")
print(f"개별 점수 차이: {new_results}")
print(f"평균 점수 차이: {sum(new_results) / len(new_results):.2f}")
print(f"최대 점수 차이: {max(new_results)}")
print(f"최소 점수 차이: {min(new_results)}")

print("\n--- 시뮬레이션 비교 및 정리 ---")
print(f"기존 방식 평균 점수 차이: {sum(old_results) / len(old_results):.2f}")
print(f"새로운 방식 평균 점수 차이: {sum(new_results) / len(new_results):.2f}")
