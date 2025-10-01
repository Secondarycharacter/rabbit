const container = document.getElementById("iconContainer");
const icons = document.querySelectorAll(".icon");
const resetBtn = document.getElementById("resetBtn");
const arrowTop = document.getElementById("arrowTop");
const arrowBottom = document.getElementById("arrowBottom");
const projectScreen = document.querySelector(".project-screen");

let dragging = null;
let startX, startY, origX, origY;
let initialPositions = {};
let afIndex = 0; // A~G 올라온 개수
let isResponsive = false; // 반응형 모드 여부
let isFirstLoad = true; // 최초 로드 여부
let imageSizes = {}; // 이미지 크기 저장

// 그리드 설정
const GRID_X = 120;
const GRID_Y = 160;
const GRID_START_X = 80;  // 첫 번째 그리드 셀의 시작점
const GRID_START_Y = 80;
const MARGIN = 80;
const CONTAINER_WIDTH = 2560;
const CONTAINER_HEIGHT = 1280;

// 각 아이콘의 그리드 위치 (인덱스 기반)
const iconGridPositions = {
  '1': { gridX: 0, gridY: 0 },  // 첫 번째 열, 첫 번째 행
  '2': { gridX: 0, gridY: 1 },
  '3': { gridX: 0, gridY: 2 },
  '4': { gridX: 0, gridY: 3 },
  '5': { gridX: 0, gridY: 4 },
  '6': { gridX: 0, gridY: 5 },
  '7': { gridX: 0, gridY: 6 },
  'A': { gridX: 1, gridY: 0 },  // 두 번째 열, 첫 번째 행
  'B': { gridX: 1, gridY: 1 },
  'C': { gridX: 1, gridY: 2 },
  'D': { gridX: 1, gridY: 3 },
  'E': { gridX: 1, gridY: 4 },
  'F': { gridX: 1, gridY: 5 },
  'G': { gridX: 1, gridY: 6 },
  'cabinet': { gridX: 19, gridY: 0 },
  'favorites': { gridX: 19, gridY: 1 },
  'manager': { gridX: 19, gridY: 2 },
  'park': { gridX: 17, gridY: 6 },
  'yong': { gridX: 16, gridY: 6 },
  'trash': { gridX: 19, gridY: 6 }
};

// 그리드 좌표를 픽셀 좌표로 변환 (중앙 정렬)
function gridToPixel(gridX, gridY, imageWidth, imageHeight) {
  const centerX = GRID_START_X + (gridX * GRID_X) + (GRID_X / 2);
  const centerY = GRID_START_Y + (gridY * GRID_Y) + (GRID_Y / 2);
  
  return {
    x: centerX - (imageWidth / 2),
    y: centerY - (imageHeight / 2)
  };
}

// 픽셀 좌표를 가장 가까운 그리드 좌표로 변환
function pixelToGrid(pixelX, pixelY, imageWidth, imageHeight) {
  const centerX = pixelX + (imageWidth / 2);
  const centerY = pixelY + (imageHeight / 2);
  
  const gridX = Math.round((centerX - GRID_START_X - GRID_X/2) / GRID_X);
  const gridY = Math.round((centerY - GRID_START_Y - GRID_Y/2) / GRID_Y);
  
  return { gridX, gridY };
}

// 이미지 크기 측정 및 좌표 계산 함수
function calculateImagePositions() {
  const allImages = document.querySelectorAll('img');
  
  allImages.forEach(img => {
    if (img.complete && img.naturalWidth > 0) {
      applyCalculatedPosition(img, img.naturalWidth, img.naturalHeight);
    } else {
      img.addEventListener('load', function() {
        applyCalculatedPosition(this, this.naturalWidth, this.naturalHeight);
      });
    }
  });
}

// 이미지 위치 적용 (초기 배치)
function applyCalculatedPosition(img, width, height) {
  const id = img.dataset?.id || img.id;
  
  // project_screen은 그리드 시스템 적용하지 않고 고정 좌표 사용
  if (id === 'project') {
    imageSizes[id] = { width, height };
    img.style.left = '380px';
    img.style.top = '80px';
    return;
  }
  
  const gridPos = iconGridPositions[id];
  
  if (!gridPos) {
    // 화살표 처리
    if (id === 'arrowTop') {
      img.style.left = (140 - width/2) + 'px';
      img.style.top = (40 - height) + 'px';
    } else if (id === 'arrowBottom') {
      img.style.left = (140 - width/2) + 'px';
      img.style.top = (1240 - height) + 'px';
    }
    return;
  }
  
  imageSizes[id] = { width, height };
  
  const pixelPos = gridToPixel(gridPos.gridX, gridPos.gridY, width, height);
  img.style.left = pixelPos.x + 'px';
  img.style.top = pixelPos.y + 'px';
}

// 초기 위치 저장
function saveInitialPositions() {
  if (isFirstLoad) {
    document.querySelectorAll('.icon').forEach(el => {
      const key = el.dataset?.id || el.id;
      initialPositions[key] = {
        left: el.style.left,
        top: el.style.top,
        opacity: el.style.opacity || '1',
        transform: el.style.transform || 'translateY(0)'
      };
    });
    localStorage.setItem('rabbitHomepage_initialPositions', JSON.stringify(initialPositions));
    isFirstLoad = false;
  }
}

// 저장된 초기 위치 불러오기
function loadInitialPositions() {
  const saved = localStorage.getItem('rabbitHomepage_initialPositions');
  if (saved) {
    initialPositions = JSON.parse(saved);
  }
}

// 페이지 로드 시 초기 위치 불러오기
loadInitialPositions();

// 동적 스케일링 함수
function updateContainerScale() {
  const container = document.getElementById('iconContainer');
  const viewportWidth = window.innerWidth;
  const viewportHeight = window.innerHeight;
  
  // 컨테이너 크기
  const containerWidth = 2560;
  const containerHeight = 1280;
  
  // 스케일 계산 (화면에 맞게 축소)
  const scaleX = viewportWidth / containerWidth;
  const scaleY = viewportHeight / containerHeight;
  const scale = Math.min(scaleX, scaleY);
  
  // 스케일 적용
  container.style.transform = `scale(${scale})`;
  
  console.log(`Container scale updated: ${scale.toFixed(3)} (viewport: ${viewportWidth}x${viewportHeight})`);
}

// 페이지가 완전히 로드된 후 초기 위치 저장 및 이미지 위치 계산
window.addEventListener('load', () => {
  setTimeout(() => {
    calculateImagePositions();
    saveInitialPositions();
    updateContainerScale(); // 초기 스케일 설정
  }, 100);
});


// 스냅 기능 (마그네틱) - 그리드 안의 이미지 위치 유지
function snapToGrid(icon) {
  if (icon.classList.contains('project-screen')) return; // 프로젝트 스크린 제외
  
  const id = icon.dataset?.id;
  const size = imageSizes[id] || { width: 120, height: 160 };
  
  const currentX = parseInt(icon.style.left);
  const currentY = parseInt(icon.style.top);
  
  // 현재 위치에서 가장 가까운 그리드 찾기
  const grid = pixelToGrid(currentX, currentY, size.width, size.height);
  
  // 마진 영역 체크 - 마진 영역에 배치되지 않도록 제한
  const minGridX = 0;
  const minGridY = 0;
  const maxGridX = Math.floor((CONTAINER_WIDTH - GRID_START_X) / GRID_X) - 1;
  const maxGridY = Math.floor((CONTAINER_HEIGHT - GRID_START_Y) / GRID_Y) - 1;
  
  // 그리드 경계 내로 제한
  grid.gridX = Math.max(minGridX, Math.min(grid.gridX, maxGridX));
  grid.gridY = Math.max(minGridY, Math.min(grid.gridY, maxGridY));
  
  // 픽셀 위치로 변환하여 적용
  const pixelPos = gridToPixel(grid.gridX, grid.gridY, size.width, size.height);
  icon.style.left = pixelPos.x + 'px';
  icon.style.top = pixelPos.y + 'px';
  
  return grid;
}

// 충돌 감지 (그리드 기반)
function checkCollision(gridX, gridY, spanX = 1, spanY = 1, excludeIcon = null) {
  for (let icon of document.querySelectorAll('.icon')) {
    if (icon === excludeIcon) continue;
    if (icon.classList.contains('project-screen')) continue;
    
    const id = icon.dataset?.id;
    const iconGrid = pixelToGrid(
      parseInt(icon.style.left),
      parseInt(icon.style.top),
      imageSizes[id]?.width || 120,
      imageSizes[id]?.height || 160
    );
    
    const iconSpan = iconGridPositions[id] || { spanX: 1, spanY: 1 };
    
    // 그리드 범위 겹침 체크
    if (gridX < iconGrid.gridX + (iconSpan.spanX || 1) &&
        gridX + spanX > iconGrid.gridX &&
        gridY < iconGrid.gridY + (iconSpan.spanY || 1) &&
        gridY + spanY > iconGrid.gridY) {
      return true;
    }
  }
  return false;
}

// 겹침 방지 (그리드 기반) - 마진 영역 고려
function preventOverlap(draggedIcon) {
  const id = draggedIcon.dataset?.id;
  const size = imageSizes[id] || { width: 120, height: 160 };
  
  const currentX = parseInt(draggedIcon.style.left);
  const currentY = parseInt(draggedIcon.style.top);
  
  const grid = pixelToGrid(currentX, currentY, size.width, size.height);
  
  // 마진 영역 체크 - 마진 영역에 배치되지 않도록 제한
  const minGridX = 0;
  const minGridY = 0;
  const maxGridX = Math.floor((CONTAINER_WIDTH - GRID_START_X) / GRID_X) - 1;
  const maxGridY = Math.floor((CONTAINER_HEIGHT - GRID_START_Y) / GRID_Y) - 1;
  
  // 그리드 경계 내로 제한
  grid.gridX = Math.max(minGridX, Math.min(grid.gridX, maxGridX));
  grid.gridY = Math.max(minGridY, Math.min(grid.gridY, maxGridY));
  
  // 충돌 시 가장 가까운 빈 그리드 찾기
  if (checkCollision(grid.gridX, grid.gridY, 1, 1, draggedIcon)) {
    // 주변 그리드에서 빈 공간 찾기 (마진 영역 내에서만)
    for (let offset = 1; offset <= 3; offset++) {
      const directions = [
        { x: grid.gridX + offset, y: grid.gridY },
        { x: grid.gridX - offset, y: grid.gridY },
        { x: grid.gridX, y: grid.gridY + offset },
        { x: grid.gridX, y: grid.gridY - offset }
      ];
      
      for (let dir of directions) {
        // 마진 영역 체크
        if (dir.x >= minGridX && dir.x <= maxGridX && 
            dir.y >= minGridY && dir.y <= maxGridY &&
            !checkCollision(dir.x, dir.y, 1, 1, draggedIcon)) {
          const pixelPos = gridToPixel(dir.x, dir.y, size.width, size.height);
          draggedIcon.style.left = pixelPos.x + 'px';
          draggedIcon.style.top = pixelPos.y + 'px';
          return;
        }
      }
    }
  }
}

// 아이콘 드래그 기능
icons.forEach(icon => {
  icon.addEventListener("mousedown", (e) => {
    if (dragging) return;
    
    // 반응형 모드에서 1~7, A~G 드래그 비활성화
    if (isResponsive && (icon.classList.contains('icon-left') || icon.classList.contains('icon-af'))) {
      return;
    }
    
    e.preventDefault();
    
    dragging = icon;
    startX = e.clientX;
    startY = e.clientY;
    origX = parseInt(icon.style.left);
    origY = parseInt(icon.style.top);
    icon.classList.add("dragging");
    
    // 드래그 중에는 transition 비활성화하여 부드러운 움직임
    icon.style.transition = "none";

    const onMouseMove = (e) => {
      // 마우스 이동 거리만큼 아이콘 이동 (1:1 비율)
      const deltaX = e.clientX - startX;
      const deltaY = e.clientY - startY;
      
      const newX = origX + deltaX;
      const newY = origY + deltaY;
      
      // 화면 경계 체크만 적용 (드래그 중에는 그리드 스냅 없음)
      const isProjectScreen = icon.classList.contains('project-screen');
      const iconWidth = isProjectScreen ? (icon.naturalWidth || 1800) : (icon.naturalWidth || 120);
      const iconHeight = isProjectScreen ? (icon.naturalHeight || 1100) : (icon.naturalHeight || 120);

      const boundedX = Math.max(isProjectScreen ? 0 : MARGIN, Math.min(newX, CONTAINER_WIDTH - (isProjectScreen ? 0 : MARGIN) - iconWidth));
      const boundedY = Math.max(isProjectScreen ? 0 : MARGIN, Math.min(newY, CONTAINER_HEIGHT - (isProjectScreen ? 0 : MARGIN) - iconHeight));
      
      icon.style.left = boundedX + "px";
      icon.style.top = boundedY + "px";
    };

    const onMouseUp = (e) => {
      icon.classList.remove("dragging");
      
      // transition 복원
      icon.style.transition = "all 0.5s ease";
      
      // 프로젝트 스크린이 아닌 경우에만 그리드 적용 (마그네틱 기능)
      if (!icon.classList.contains('project-screen')) {
        snapToGrid(icon);
        preventOverlap(icon);
      }
      
      document.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseup", onMouseUp);
      dragging = null;
    };

    document.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mouseup", onMouseUp);
  });

  // 더블클릭 이벤트 추가
  icon.addEventListener("dblclick", (e) => {
    e.preventDefault();
    
    if (icon.classList.contains('project-screen')) {
      // 프로젝트 스크린 더블클릭 시 내용 표시 로직
      console.log("Project Screen 더블클릭");
    } else if (icon.classList.contains('icon-right')) {
      // 오른쪽 아이콘 더블클릭 시 projectScreen에 내용 출력
      projectScreen.src = `images/project_screen_${icon.dataset.id}.png`;
      console.log(`${icon.dataset.id} 더블클릭, projectScreen 업데이트`);
    }
  });
});

// 초기화 버튼
resetBtn.addEventListener("click", () => {
  document.querySelectorAll(".icon").forEach(el => {
    let key = el.dataset?.id || el.id;
    
    // project_screen은 고정 좌표로 초기화
    if (key === 'project') {
      el.style.left = '380px';
      el.style.top = '80px';
      el.style.opacity = '1';
      el.style.transform = 'translateY(0)';
    } else if (initialPositions[key]) {
      el.style.left = initialPositions[key].left;
      el.style.top = initialPositions[key].top;
      el.style.opacity = initialPositions[key].opacity || "1";
      el.style.transform = initialPositions[key].transform || "translateY(0)";
    }
  });
  
  // A~G 상태 초기화
  afIndex = 0;
  arrowTop.classList.remove("show");
  
  // 반응형 모드 해제
  if (isResponsive) {
    toggleResponsiveMode(false);
  }
  
  console.log('초기화 완료 - 저장된 초기 위치로 복원');
});

// 프로젝트 스크린 위치 감시
function checkProjectScreenPosition() {
  const projectX = parseInt(projectScreen.style.left);
  
  // gridX: 0~1 영역 계산 (80px ~ 320px)
  const grid0Start = GRID_START_X; // 80px
  const grid1End = GRID_START_X + (2 * GRID_X); // 80 + (2 * 120) = 320px
  
  if (projectX >= grid0Start && projectX <= grid1End && !isResponsive) {
    isResponsive = true;
    toggleResponsiveMode(true);
  } else if ((projectX < grid0Start || projectX > grid1End) && isResponsive) {
    isResponsive = false;
    toggleResponsiveMode(false);
  }
}

// 반응형 모드 토글
function toggleResponsiveMode(enable) {
  const afIcons = document.querySelectorAll(".icon-af");
  const baseIcons = document.querySelectorAll(".icon:not(.icon-af):not(.icon-right):not(.project-screen)");
  
  if (enable) {
    // 1~7번 아이콘들을 초기 그리드 위치로 복원
    baseIcons.forEach((icon) => {
      const id = icon.dataset.id;
      const size = imageSizes[id] || { width: 120, height: 160 };
      
      // iconGridPositions에서 초기 그리드 위치 가져오기
      const gridPos = iconGridPositions[id];
      if (gridPos) {
        const pixelPos = gridToPixel(gridPos.gridX, gridPos.gridY, size.width, size.height);
        icon.style.left = pixelPos.x + 'px';
        icon.style.top = pixelPos.y + 'px';
        icon.style.opacity = "1";
        icon.style.transform = "translateY(0)";
      }
    });
    
    // A~G 아이콘들을 아래로 이동 (숨김 처리) - gridY: 7 위치
    afIcons.forEach((icon, index) => {
      const id = icon.dataset.id;
      const size = imageSizes[id] || { width: 120, height: 160 };
      const pixelPos = gridToPixel(0, 7, size.width, size.height);
      
      icon.style.left = pixelPos.x + 'px';
      icon.style.top = pixelPos.y + 'px';
      icon.style.opacity = "0";
      icon.style.display = "block";
    });
    arrowBottom.classList.add("show");
    afIndex = 0;
  } else {
    // 원래 위치로 복원 (화면이 커진 경우) - iconGridPositions 사용
    afIcons.forEach((icon) => {
      const id = icon.dataset.id;
      const size = imageSizes[id] || { width: 120, height: 160 };
      
      // iconGridPositions에서 초기 그리드 위치 가져오기
      const gridPos = iconGridPositions[id];
      if (gridPos) {
        const pixelPos = gridToPixel(gridPos.gridX, gridPos.gridY, size.width, size.height);
        icon.style.left = pixelPos.x + 'px';
        icon.style.top = pixelPos.y + 'px';
        icon.style.opacity = "1";
        icon.style.transform = "translateY(0)";
        icon.style.display = "block";
      }
    });
    
    // 1~7번도 초기 위치로 복원 - iconGridPositions 사용
    baseIcons.forEach((icon) => {
      const id = icon.dataset.id;
      const size = imageSizes[id] || { width: 120, height: 160 };
      
      // iconGridPositions에서 초기 그리드 위치 가져오기
      const gridPos = iconGridPositions[id];
      if (gridPos) {
        const pixelPos = gridToPixel(gridPos.gridX, gridPos.gridY, size.width, size.height);
        icon.style.left = pixelPos.x + 'px';
        icon.style.top = pixelPos.y + 'px';
        icon.style.opacity = "1";
        icon.style.transform = "translateY(0)";
      }
    });
    
    arrowBottom.classList.remove("show");
    arrowTop.classList.remove("show");
    afIndex = 0;
  }
}

// 아래쪽 화살표 클릭 (A~G 위로 등장, 1~7 줄어듦)
arrowBottom.addEventListener("click", () => {
  const afIcons = document.querySelectorAll(".icon-af");
  const baseIcons = document.querySelectorAll(".icon:not(.icon-af):not(.icon-right):not(.project-screen)");
  
  // 화살표의 아래쪽 y좌표 계산 (동적으로)
  const arrowTopRect = arrowTop.getBoundingClientRect();
  const containerRect = container.getBoundingClientRect();
  const arrowTopBottomY = arrowTopRect.bottom - containerRect.top;

  if (afIndex < afIcons.length) {
    // A~G 아이콘들을 순차적으로 이동
    afIcons.forEach((icon, index) => {
      const id = icon.dataset.id;
      const size = imageSizes[id] || { width: 120, height: 160 };
      
      if (index < afIndex) {
        // 이미 등장한 아이콘들 - 한 칸씩 위로 이동
        const targetGridY = 6 - afIndex + index;
        const pixelPos = gridToPixel(0, targetGridY, size.width, size.height);
        
        icon.style.left = pixelPos.x + 'px';
        icon.style.top = pixelPos.y + 'px';
        icon.style.opacity = "1";
        icon.style.display = "block";
        icon.style.transition = "all 0.5s ease";
      } else if (index === afIndex) {
        // 현재 클릭으로 등장할 아이콘 - gridY: 6에서 페이드인
        const pixelPos = gridToPixel(0, 6, size.width, size.height);
        
        icon.style.left = pixelPos.x + 'px';
        icon.style.top = pixelPos.y + 'px';
        icon.style.opacity = "1";
        icon.style.display = "block";
        icon.style.transition = "all 0.5s ease";
      } else {
        // 아직 등장하지 않은 아이콘들 - 투명 상태로 gridY: 7에 대기
        const pixelPos = gridToPixel(0, 7, size.width, size.height);
        
        icon.style.left = pixelPos.x + 'px';
        icon.style.top = pixelPos.y + 'px';
        icon.style.opacity = "0";
        icon.style.transition = "all 0.5s ease";
      }
    });
    
    // 1~7번 아이콘들을 한 칸씩 위로 이동
    baseIcons.forEach((icon, index) => {
      const id = icon.dataset.id;
      const size = imageSizes[id] || { width: 120, height: 160 };
      
      // 현재 위치에서 한 칸 위로 이동
      const currentGrid = pixelToGrid(parseInt(icon.style.left), parseInt(icon.style.top), size.width, size.height);
      const newGridY = currentGrid.gridY - 1;
      
      if (newGridY >= 0) {
        const pixelPos = gridToPixel(currentGrid.gridX, newGridY, size.width, size.height);
        icon.style.left = pixelPos.x + 'px';
        icon.style.top = pixelPos.y + 'px';
        icon.style.transition = "all 0.5s ease";
      } else {
        // 화면 밖으로 이동 (숨김) - gridY: -1 위치
        const pixelPos = gridToPixel(0, -1, size.width, size.height);
        icon.style.left = pixelPos.x + 'px';
        icon.style.top = pixelPos.y + 'px';
        icon.style.opacity = "0";
        icon.style.transition = "all 0.5s ease";
      }
    });
    
    afIndex++;
  }
  
  // 모든 A~G가 올라왔으면 위쪽 화살표 표시
  if (afIndex === afIcons.length) {
    arrowTop.classList.add("show");
  }
  
  // 1번 아이콘이 화면 밖으로 나갔는지 체크
  checkFirstIconPosition();
});

// 위쪽 화살표 클릭 (되돌리기)
arrowTop.addEventListener("click", () => {
  const afIcons = document.querySelectorAll(".icon-af");
  const baseIcons = document.querySelectorAll(".icon:not(.icon-af):not(.icon-right):not(.project-screen)");

  if (afIndex > 0) {
    afIndex--;
    
    // 1~7 아이콘들을 순차적으로 이동 (7, 6, 5, 4, 3, 2, 1 순서)
    baseIcons.forEach((icon, index) => {
      const id = icon.dataset.id;
      const size = imageSizes[id] || { width: 120, height: 160 };
      
      // afIndex가 감소할 때마다 1~7 아이콘이 하나씩 나타남 (7번부터 역순)
      // afIndex=7일 때: 아무것도 등장하지 않음
      // afIndex=6일 때: 7번(index 6) 등장
      // afIndex=5일 때: 6번(index 5) 등장
      // afIndex=4일 때: 5번(index 4) 등장
      const targetIndex = afIndex; // afIndex=6일 때 6번(7번), afIndex=5일 때 5번(6번)...
      
      if (index === targetIndex) {
        // 현재 클릭으로 등장할 아이콘 - gridY: 0에서 페이드인
        const pixelPos = gridToPixel(0, 0, size.width, size.height);
        
        icon.style.left = pixelPos.x + 'px';
        icon.style.top = pixelPos.y + 'px';
        icon.style.opacity = "1";
        icon.style.display = "block";
        icon.style.transition = "all 0.5s ease";
      } else if (index > targetIndex) {
        // 이미 등장한 아이콘들 - 한 칸씩 아래로 이동
        const targetGridY = index - targetIndex;
        const pixelPos = gridToPixel(0, targetGridY, size.width, size.height);
        
        icon.style.left = pixelPos.x + 'px';
        icon.style.top = pixelPos.y + 'px';
        icon.style.opacity = "1";
        icon.style.display = "block";
        icon.style.transition = "all 0.5s ease";
      } else {
        // 아직 등장하지 않은 아이콘들 - 투명 상태로 gridY: -1에 대기
        const pixelPos = gridToPixel(0, -1, size.width, size.height);
        
        icon.style.left = pixelPos.x + 'px';
        icon.style.top = pixelPos.y + 'px';
        icon.style.opacity = "0";
        icon.style.transition = "all 0.5s ease";
      }
    });
    
    // A~G 아이콘들을 등장의 역순으로 이동
    afIcons.forEach((icon, index) => {
      const id = icon.dataset.id;
      const size = imageSizes[id] || { width: 120, height: 160 };
      
      // 등장 순서: A(0), B(1), C(2), D(3), E(4), F(5), G(6)
      // 사라지는 순서: G(6), F(5), E(4), D(3), C(2), B(1), A(0)
      
      if (index < afIndex) {
        // 아직 사라지지 않은 아이콘들 - 한 칸씩 아래로 이동
        const targetGridY = 6 - afIndex + index + 1; // 한 칸씩 아래로 이동
        const pixelPos = gridToPixel(0, targetGridY, size.width, size.height);
        
        icon.style.left = pixelPos.x + 'px';
        icon.style.top = pixelPos.y + 'px';
        icon.style.opacity = "1";
        icon.style.transition = "all 0.5s ease";
      } else {
        // 사라진 아이콘들 - gridY: 7로 이동하고 투명 처리
        const pixelPos = gridToPixel(0, 7, size.width, size.height);
        
        icon.style.left = pixelPos.x + 'px';
        icon.style.top = pixelPos.y + 'px';
        icon.style.opacity = "0";
        icon.style.transition = "all 0.5s ease";
      }
    });
  }
  
  // 모든 A~G가 내려갔으면 위쪽 화살표 숨김
  if (afIndex === 0) {
    arrowTop.classList.remove("show");
  }
  
  // 1번 아이콘 위치 체크
  checkFirstIconPosition();
});

// 1번 아이콘이 { gridX: 0, gridY: 0 } 위치에 있지 않은 경우 arrowTop 표시
function checkFirstIconPosition() {
  const firstIcon = document.querySelector('.icon[data-id="1"]');
  
  if (!firstIcon) {
    console.log("1번 아이콘을 찾을 수 없습니다.");
    return;
  }
  
  const firstIconTop = parseInt(firstIcon.style.top);
  const firstIconLeft = parseInt(firstIcon.style.left);
  
  // 1번 아이콘의 그리드 좌표 계산
  const firstIconGrid = pixelToGrid(firstIconLeft, firstIconTop, 
    imageSizes['1']?.width || 120, imageSizes['1']?.height || 160);
  
  console.log(`Checking arrowTop visibility. 1번 아이콘 위치: left=${firstIconLeft}, top=${firstIconTop}`);
  console.log(`1번 아이콘 그리드 좌표: gridX=${firstIconGrid.gridX}, gridY=${firstIconGrid.gridY}`);
  
  // 1번 아이콘이 { gridX: 0, gridY: 0 } 위치에 있지 않으면 arrowTop 표시
  const isAtGrid00 = (firstIconGrid.gridX === 0 && firstIconGrid.gridY === 0);
  
  console.log(`1번 아이콘이 { gridX: 0, gridY: 0 }에 있는가: ${isAtGrid00}`);
  
  if (!isAtGrid00) {
    arrowTop.classList.add("show");
    console.log("arrowTop shown - 1번 아이콘이 { gridX: 0, gridY: 0 }에 없음");
  } else {
    arrowTop.classList.remove("show");
    console.log("arrowTop hidden - 1번 아이콘이 { gridX: 0, gridY: 0 }에 있음");
  }
}

// 이벤트 리스너 등록
window.addEventListener("resize", () => {
  updateContainerScale();
  checkProjectScreenPosition();
});

// 프로젝트 스크린 위치 체크를 위한 주기적 업데이트
setInterval(() => {
  checkProjectScreenPosition();
  checkFirstIconPosition();
}, 100);