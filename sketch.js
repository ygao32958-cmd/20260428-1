// Hand Pose Detection with ml5.js
// https://thecodingtrain.com/tracks/ml5js-beginners-guide/ml5/hand-pose

let video;
let handPose;
let hands = [];
let bubbles = []; // 儲存水泡物件的陣列

function preload() {
  // Initialize HandPose model with flipped video input
  handPose = ml5.handPose({ flipped: true });
}

function mousePressed() {
  console.log(hands);
}

function gotHands(results) {
  hands = results;
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  video = createCapture(VIDEO, { flipped: true });
  video.size(640, 480); // 設定攝影機擷取解析度
  video.hide();

  // Start detecting hands
  handPose.detectStart(video, gotHands);
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}

function draw() {
  background('#e7c6ff');

  // 1. 在置中上方加上文字
  fill(0);
  noStroke();
  textSize(24);
  textAlign(CENTER);
  text("414730878 高翊嘉", width / 2, 40);

  // 計算顯示影像的寬高與起始座標 (置中且為畫布 50%)
  let displayW = width * 0.5;
  let displayH = height * 0.5;
  let startX = (width - displayW) / 2;
  let startY = (height - displayH) / 2;

  image(video, startX, startY, displayW, displayH);

  // Ensure at least one hand is detected
  if (hands.length > 0) {
    for (let hand of hands) {
      if (hand.confidence > 0.1) {
        // 先將所有節點座標映射到畫布上的顯示區域並儲存
        let points = [];
        for (let kp of hand.keypoints) {
          points.push({
            x: map(kp.x, 0, video.width, startX, startX + displayW),
            y: map(kp.y, 0, video.height, startY, startY + displayH)
          });
        }

        // 設定顏色 (根據左右手決定線條與填充顏色)
        if (hand.handedness == "Left") {
          stroke(255, 0, 255);
          fill(255, 0, 255);
        } else {
          stroke(255, 255, 0);
          fill(255, 255, 0);
        }

        // 畫線串接指定範圍的節點
        strokeWeight(3);
        connectPoints(points, 0, 4);   // 大拇指 (0-4)
        connectPoints(points, 5, 8);   // 食指 (5-8)
        connectPoints(points, 9, 12);  // 中指 (9-12)
        connectPoints(points, 13, 16); // 無名指 (13-16)
        connectPoints(points, 17, 20); // 小拇指 (17-20)

        // 在指尖 (4, 8, 12, 16, 20) 產生水泡
        let fingerTips = [4, 8, 12, 16, 20];
        if (frameCount % 2 === 0) { // 控制水泡產生頻率
          for (let index of fingerTips) {
            bubbles.push(new Bubble(points[index].x, points[index].y));
          }
        }

        // 畫出所有節點圓圈
        noStroke();
        for (let p of points) {
          circle(p.x, p.y, 12);
        }
      }
    }
  }

  // 更新並顯示所有水泡
  for (let i = bubbles.length - 1; i >= 0; i--) {
    bubbles[i].update();
    bubbles[i].display();
    
    // 如果水泡破掉 (生命值耗盡) 就移除
    if (bubbles[i].isFinished()) {
      bubbles.splice(i, 1);
    }
  }
}

// 輔助函式：串接指定索引範圍內的點
function connectPoints(points, start, end) {
  for (let i = start; i < end; i++) {
    line(points[i].x, points[i].y, points[i + 1].x, points[i + 1].y);
  }
}

// 水泡類別
class Bubble {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.vx = random(-1, 1); // 左右微小晃動
    this.vy = random(-2, -4); // 向上升的速度
    this.size = random(5, 15);
    this.alpha = 200; // 初始透明度
  }

  update() {
    this.x += this.vx;
    this.y += this.vy;
    this.alpha -= 2; // 隨著上升逐漸變透明
  }

  display() {
    stroke(255, this.alpha);
    strokeWeight(1);
    noFill();
    circle(this.x, this.y, this.size);
  }

  isFinished() {
    return this.alpha <= 0;
  }
}
