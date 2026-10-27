window.ANIME_TEST_DATA = {
  axes: [
    { id: "R", label: "감상 습관", sideA: "R", sideB: "S", sideAName: "정주행형", sideBName: "꾸준형" },
    { id: "C", label: "작품 선택 기준", sideA: "C", sideB: "W", sideAName: "캐릭터 우선형", sideBName: "작품성 우선형" },
    { id: "F", label: "취향 탐색 방식", sideA: "F", sideB: "E", sideAName: "취향 확신형", sideBName: "취향 확장형" },
    { id: "P", label: "덕질 표현 방식", sideA: "P", sideB: "D", sideAName: "개인 향유형", sideBName: "공개 표현형" }
  ],

  questions: [
    { id: "R1", text: "애니메이션을 보기 시작하면 여러 화를 연달아 이어서 보는 편이다.", axis: "R", side: "A" },
    { id: "R2", text: "재미있는 작품을 발견하면 다음 전개가 궁금해서 가능한 한 빠르게 이어서 본다.", axis: "R", side: "A" },
    { id: "R3", text: "새 시즌이 공개되면 주말에 한꺼번에 몰아서 볼 계획부터 세운다.", axis: "R", side: "A" },
    { id: "S1", text: "한 번에 많은 화를 보기보다는 하루에 조금씩 나누어 보는 편이다.", axis: "R", side: "B" },
    { id: "S2", text: "한 작품을 감상할 때 속도를 내기보다는 내 일상에 맞춰 천천히 즐기는 편이다.", axis: "R", side: "B" },
    { id: "S3", text: "매주 방영일에 맞춰 한 화씩 기다려 보는 시간이 즐겁다.", axis: "R", side: "B" },

    { id: "C1", text: "매력적인 캐릭터가 등장한다는 사실만으로도 그 애니메이션을 보고 싶어진다.", axis: "C", side: "A" },
    { id: "C2", text: "작품을 다 보고 나서도 좋아하는 캐릭터의 매력이나 관계성이 오래 기억에 남는 편이다.", axis: "C", side: "A" },
    { id: "C3", text: "작품을 고를 때 내 최애 캐릭터가 얼마나 비중 있게 나오는지가 먼저 궁금하다.", axis: "C", side: "A" },
    { id: "W1", text: "캐릭터가 마음에 들어도 이야기나 연출이 아쉽다면 작품에 깊이 빠지기 어렵다.", axis: "C", side: "B" },
    { id: "W2", text: "캐릭터뿐 아니라 스토리, 연출, 작화, 음악 등이 얼마나 잘 어우러지는지를 중요하게 생각한다.", axis: "C", side: "B" },
    { id: "W3", text: "평점이나 리뷰에서 구성과 완성도에 대한 평가를 꼼꼼히 확인한다.", axis: "C", side: "B" },

    { id: "F1", text: "새로운 작품을 고를 때는 내가 좋아하는 장르나 분위기인지 먼저 확인하는 편이다.", axis: "F", side: "A" },
    { id: "F2", text: "이미 좋아하는 장르나 분위기의 작품을 더 찾아보는 것이 즐겁다.", axis: "F", side: "A" },
    { id: "F3", text: "이미 검증된 취향의 작품을 다시 보는 것이 새 작품을 찾는 것보다 편하다.", axis: "F", side: "A" },
    { id: "E1", text: "평소 즐겨 보지 않는 장르라도 흥미로운 작품이라면 도전해 보는 편이다.", axis: "F", side: "B" },
    { id: "E2", text: "예상과 다른 분위기나 낯선 설정을 가진 작품을 발견하면 오히려 호기심이 생긴다.", axis: "F", side: "B" },
    { id: "E3", text: "추천 목록에서 처음 보는 장르를 일부러 골라 볼 때가 있다.", axis: "F", side: "B" },

    { id: "P1", text: "좋아하는 작품이 있어도 다른 사람에게 알리기보다는 혼자 즐기는 것으로 충분할 때가 많다.", axis: "P", side: "A" },
    { id: "P2", text: "애니메이션을 즐기는 경험은 굳이 다른 사람에게 보여주지 않아도 나만 만족하면 충분하다.", axis: "P", side: "A" },
    { id: "P3", text: "덕질 기록이나 굿즈는 나만 보는 공간에 모아 두는 편이다.", axis: "P", side: "A" },
    { id: "D1", text: "좋아하는 작품을 발견하면 친구에게 추천하거나 다른 사람과 이야기를 나누고 싶어진다.", axis: "P", side: "B" },
    { id: "D2", text: "좋아하는 작품이나 캐릭터에 대한 감상을 SNS나 커뮤니티 등에서 표현하는 편이다.", axis: "P", side: "B" },
    { id: "D3", text: "방영 후 다른 사람들의 반응을 찾아보고 내 생각을 나누고 싶다.", axis: "P", side: "B" }
  ],

  scale: [
    { value: 1, label: "전혀 그렇지 않다" },
    { value: 2, label: "그렇지 않다" },
    { value: 3, label: "약간 그렇지 않다" },
    { value: 4, label: "보통이다" },
    { value: 5, label: "약간 그렇다" },
    { value: 6, label: "그렇다" },
    { value: 7, label: "매우 그렇다" }
  ],

  adjectiveByPair: {
    FP: "조용히 깊게 파는",
    FD: "애정을 나누는",
    EP: "혼자 탐험하는",
    ED: "취향을 넓혀 전하는"
  },

  nounByPair: {
    RC: "캐릭터 수집가",
    RW: "정주행 평론가",
    SC: "다정한 캐릭터 집사",
    SW: "느긋한 감상가"
  },

  typeMeta: {
    RCFP: { tagline: "조용히 깊게 파는 캐릭터 수집가", description: "좋아하는 캐릭터와 관계를 가장 중요하게 생각하며, 혼자 깊게 몰입하는 편이에요." },
    RCFD: { tagline: "애정을 나누는 캐릭터 수집가", description: "캐릭터에 대한 애정을 꺼내고 함께 나누는 것을 좋아해요." },
    RCEP: { tagline: "혼자 탐험하는 캐릭터 수집가", description: "캐릭터가 마음에 들면 조용히 즐기며 자기만의 기준으로 몰입해요." },
    RCED: { tagline: "취향을 넓혀 전하는 캐릭터 수집가", description: "캐릭터와 세계관을 넓히며 새로운 만남에도 호기심을 느껴요." },
    RWFP: { tagline: "조용히 깊게 파는 정주행 평론가", description: "완성도와 흐름을 숙지하며, 좋아하는 작품을 천천히 공들여 감상해요." },
    RWFD: { tagline: "애정을 나누는 정주행 평론가", description: "좋아하는 작품을 꾸준히 되새기며 주변과 함께 이야기하는 편이에요." },
    RWEP: { tagline: "혼자 탐험하는 정주행 평론가", description: "작품을 깊게 섭렵하고 스스로의 기준으로 의미를 찾는 유형이에요." },
    RWED: { tagline: "취향을 넓혀 전하는 정주행 평론가", description: "완성도 높은 작품을 발견하면 더 넓은 취향을 탐색하며 공유도 좋아해요." },
    SCFP: { tagline: "조용히 깊게 파는 다정한 캐릭터 집사", description: "캐릭터와 함께하는 덕질을 마음속에 차분히 담아두는 편이에요." },
    SCFD: { tagline: "애정을 나누는 다정한 캐릭터 집사", description: "캐릭터에 대한 애정을 따뜻하게 전달하며 관계를 이어가요." },
    SCEP: { tagline: "혼자 탐험하는 다정한 캐릭터 집사", description: "성장하는 캐릭터를 천천히 바라보며 조용히 행복을 느끼는 편이에요." },
    SCED: { tagline: "취향을 넓혀 전하는 다정한 캐릭터 집사", description: "캐릭터를 중심으로 새로운 작품과 사람을 연결하는 데 열려 있어요." },
    SWFP: { tagline: "조용히 깊게 파는 느긋한 감상가", description: "꾸준히, 편안하게 덕질하며 자기 속도로 의미를 쌓아가요." },
    SWFD: { tagline: "애정을 나누는 느긋한 감상가", description: "가볍게 추천하고 이야기 나누는 것 속에서도 깊은 애정을 느껴요." },
    SWEP: { tagline: "혼자 탐험하는 느긋한 감상가", description: "작품을 천천히 탐색하며 나만의 감상을 남기는 편이에요." },
    SWED: { tagline: "취향을 넓혀 전하는 느긋한 감상가", description: "다양한 작품을 호기심 있게 접하고, 이를 나누는 경험을 즐겨요." }
  },

  fallbackType: {
    adjective: "균형 잡힌",
    noun: "애니 감상가",
    tagline: "좋아하는 만큼, 편하게 덕질하는 감상자",
    description: "다양한 요소를 고르게 즐기며 자신만의 속도로 애니를 사랑하는 유형이에요."
  }
};
