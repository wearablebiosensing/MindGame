//====================================
//              Levels
//====================================

/*
    ATTENTION - Below is where you can add new levels
    the top level numbers represent the level, inside
    each of those levels are sub levels where you will
    add new levels if needed

    These variables are declared in engine_globals.js
    ------------------------------
    let LEVEL_X = canvas.width / 2;
    let LEVEL_Y = canvas.height / 2;
*/
const LEVELS = {
  1: {
    1: [
      OrangeSquare(LEVEL_X + 10, LEVEL_Y - 200, 0, true),
      OrangeSquare(LEVEL_X + 10, LEVEL_Y - 90, 0, true),
      OrangeSquare(LEVEL_X - 100, LEVEL_Y - 90, 0, true),
      RedCircle(LEVEL_X + 30, LEVEL_Y + 20, 0, true), // Right Circle
      RedCircle(LEVEL_X - 100, LEVEL_Y + 20, 0, true), // Right Circle
      BlueRightTriangle(LEVEL_X + 120, LEVEL_Y - 90, 270, true), // Right - Triangle
      BlueRightTriangle(LEVEL_X - 210, LEVEL_Y - 50, 180, true), // Left - Triangle],
    ],

    2: [
      //Horse
      OrangeSquare(LEVEL_X - 50, LEVEL_Y - 100, 0, true), //Body
      OrangeSquare(LEVEL_X + 60, LEVEL_Y - 100, 0, true), //Body
      PinkQuarterCircle(LEVEL_X - 60, LEVEL_Y, 180, true), //Body
      PinkQuarterCircle(LEVEL_X + 160, LEVEL_Y - 110, 180, true), //Body
      BlueRightTriangle(LEVEL_X - 160, LEVEL_Y + 10, 0, true), // Leg
      BlueRightTriangle(LEVEL_X + 60, LEVEL_Y + 10, 90, true), // Leg
      BlueRightTriangle(LEVEL_X + 170, LEVEL_Y - 210, 270, true), // Head
    ],
    3: [
      //Flower
      BlueHexagon(LEVEL_X, LEVEL_Y - 150, 0, true), //Middle Flower
      YellowDiamond(LEVEL_X - 35, LEVEL_Y - 70, 0, true), //Stem
      PurpleDiamond(LEVEL_X + 25, LEVEL_Y - 30, 50, true), //Leaf
      PurpleDiamond(LEVEL_X - 135, LEVEL_Y - 30, -50, true), //Leaf
      GreenEquilateralTriangle(LEVEL_X + 95, LEVEL_Y - 95, 120, true),
      GreenEquilateralTriangle(LEVEL_X + 100, LEVEL_Y - 200, 60, true),
      GreenEquilateralTriangle(LEVEL_X + 0, LEVEL_Y - 260, 0, true),
      GreenEquilateralTriangle(LEVEL_X - 100, LEVEL_Y - 200, -60, true),
      GreenEquilateralTriangle(LEVEL_X - 95, LEVEL_Y - 90, -120, true),
    ],
  },
  2: {
    1: [
      OrangeSquare(LEVEL_X - 50, LEVEL_Y - 400, 0, true), // Head
      BlueHexagon(LEVEL_X, LEVEL_Y - 220, 0, true), //Body
      GreenTrapezoid(LEVEL_X - 100, LEVEL_Y - 140, 180, true),
      GreenTrapezoid(LEVEL_X - 100, LEVEL_Y - 35, 0, true),
      GreenEquilateralTriangle(LEVEL_X - 0, LEVEL_Y + 100, 180, true), //Stinger
      YellowDiamond(LEVEL_X - 220, LEVEL_Y - 380, 110, true), //Left Top Wing
      YellowDiamond(LEVEL_X - 220, LEVEL_Y - 260, 75, true), //Left Bottom Wing
      YellowDiamond(LEVEL_X + 150, LEVEL_Y - 380, 75, true), //R Top Wing
      YellowDiamond(LEVEL_X + 150, LEVEL_Y - 260, 110, true), //R Bottom Wing
    ],
    2: [
      //Cat
      PinkQuarterCircle(LEVEL_X - 80, LEVEL_Y - 200, 180, true), //Head
      PinkQuarterCircle(LEVEL_X - 70, LEVEL_Y - 200, 270, true), //Head

      PinkQuarterCircle(LEVEL_X - 80, LEVEL_Y - 190, 90, true), //Head
      PinkQuarterCircle(LEVEL_X - 70, LEVEL_Y - 190, 0, true), //Head

      GreenEquilateralTriangle(LEVEL_X - 70, LEVEL_Y - 340, 0, true), //Ear
      GreenEquilateralTriangle(LEVEL_X - 220, LEVEL_Y - 200, 270, true), //Ear

      BlueHexagon(LEVEL_X + 80, LEVEL_Y - 90, 60, true), //Body
      PurpleDiamond(LEVEL_X - 25, LEVEL_Y - 50, 62, true), //Feet

      GreenTrapezoid(LEVEL_X + 70, LEVEL_Y - 20, -60, true), //Back

      YellowDiamond(LEVEL_X + 220, LEVEL_Y - 200, 10, true), //Tail
    ],

    3: [
      //Horse 2
      BlueRightTriangle(LEVEL_X - 220, LEVEL_Y - 300, 180, true), // Head
      BlueRightTriangle(LEVEL_X - 160, LEVEL_Y - 270, 135, true), // Head
      BlueRightTriangle(LEVEL_X - 80, LEVEL_Y - 190, 45, true), // Head

      GreenTrapezoid(LEVEL_X - 100, LEVEL_Y - 130, 0, true), // Body

      PurpleDiamond(LEVEL_X + 55, LEVEL_Y - 120, -2, true), //Feet
      YellowDiamond(LEVEL_X - 135, LEVEL_Y - 130, -5, true), //Feet

      YellowDiamond(LEVEL_X + 100, LEVEL_Y - 320, 20, true), //Tail
    ],
  },

  3: {
    //Butterfly
    1: [
      OrangeSquare(LEVEL_X - 50, LEVEL_Y - 370, 0, true), // Body
      OrangeSquare(LEVEL_X - 50, LEVEL_Y - 260, 0, true), // Body
      OrangeSquare(LEVEL_X - 50, LEVEL_Y - 150, 0, true), // Body
      OrangeSquare(LEVEL_X - 50, LEVEL_Y - 40, 0, true), // Body
      OrangeSquare(LEVEL_X - 50, LEVEL_Y + 70, 0, true), // Body
      YellowDiamond(LEVEL_X - 190, LEVEL_Y - 500, 110, true), //Left Ear
      YellowDiamond(LEVEL_X + 120, LEVEL_Y - 500, 70, true), //Right Ear
      GreenEquilateralTriangle(LEVEL_X + 85, LEVEL_Y - 100, 90, true), //Right Middle Wing
      GreenEquilateralTriangle(LEVEL_X - 85, LEVEL_Y - 100, 30, true), //Left Middle Wing
      BlueHexagon(LEVEL_X + 135, LEVEL_Y - 210, 30, true), //Top Right Wing
      BlueHexagon(LEVEL_X - 135, LEVEL_Y - 210, 30, true), //Bottom Right Wing
      BlueHexagon(LEVEL_X + 135, LEVEL_Y + 10, 30, true), //Top Left Wing
      BlueHexagon(LEVEL_X - 135, LEVEL_Y + 10, 30, true), //Bottom Left Wing
      GreenEquilateralTriangle(LEVEL_X + 245, LEVEL_Y - 210, 90, true), //Top Right Wing
      GreenEquilateralTriangle(LEVEL_X + 245, LEVEL_Y + 10, 90, true), //Bottom Right Wing
      GreenEquilateralTriangle(LEVEL_X - 245, LEVEL_Y - 210, 30, true), //Top Left Wing
      GreenEquilateralTriangle(LEVEL_X - 245, LEVEL_Y + 10, 30, true), //Bottom Left Wing
      PurpleDiamond(LEVEL_X - 10, LEVEL_Y + 120, 115, true), //Stinger
    ],

    //Tree
    2: [
      GreenTrapezoid(LEVEL_X - 100, LEVEL_Y + 250, 180, true), //Base of Tree

      GreenTrapezoid(LEVEL_X - 100, LEVEL_Y + 145, 180, true), //First Layer Middle
      PurpleDiamond(LEVEL_X - 195, LEVEL_Y + 95, 58, true), //First Layer Left
      PurpleDiamond(LEVEL_X + 85, LEVEL_Y + 95, -58, true), //First Layer Right

      GreenTrapezoid(LEVEL_X - 100, LEVEL_Y + 30, 180, true), //Second Layer Middle
      PurpleDiamond(LEVEL_X - 195, LEVEL_Y - 20, 58, true), //Second Layer Left
      PurpleDiamond(LEVEL_X + 85, LEVEL_Y - 20, -58, true), //Second Layer Right

      GreenEquilateralTriangle(LEVEL_X, LEVEL_Y - 10, 0, true), //Third Layer Middle
      PurpleDiamond(LEVEL_X - 145, LEVEL_Y - 130, 58, true), //Third Layer Left
      PurpleDiamond(LEVEL_X + 35, LEVEL_Y - 130, -58, true), //Third Layer Right

      GreenEquilateralTriangle(LEVEL_X, LEVEL_Y - 120, 0, true), //Fourth Layer Middle
      PurpleDiamond(LEVEL_X - 145, LEVEL_Y - 235, 58, true), //Fourth Layer Left
      PurpleDiamond(LEVEL_X + 35, LEVEL_Y - 235, -58, true), //Fourth Layer Right

      GreenTrapezoid(LEVEL_X - 100, LEVEL_Y - 300, 180, true), //Fifth Layer Middle
      GreenEquilateralTriangle(LEVEL_X, LEVEL_Y - 340, 0, true), //Top of Tree
    ],

    //Tortoise
    3: [
      BlueHexagon(LEVEL_X + 250, LEVEL_Y - 200, 0, true), //Head
      PurpleDiamond(LEVEL_X + 100, LEVEL_Y - 200, 0, true), //Neck
      GreenTrapezoid(LEVEL_X, LEVEL_Y - 20, 60, true), //Chest
      PurpleDiamond(LEVEL_X + 110, LEVEL_Y + 60, -62, true), //Front Right Leg
      PurpleDiamond(LEVEL_X - 70, LEVEL_Y - 40, -60, true), //Behind Chest
      GreenTrapezoid(LEVEL_X - 260, LEVEL_Y + 15, 180, true), //Belly
      BlueHexagon(LEVEL_X - 10, LEVEL_Y - 80, 0, true), //Right Top Shell
      GreenEquilateralTriangle(LEVEL_X - 110, LEVEL_Y - 25, 0, true), //Middle Shell
      GreenTrapezoid(LEVEL_X - 265, LEVEL_Y - 155, 125, true), //Back Shell
      PurpleDiamond(LEVEL_X - 355, LEVEL_Y - 35, 58, true), //Bottom Left Shell
      PurpleDiamond(LEVEL_X - 300, LEVEL_Y + 80, 58, true), //Back Left Leg
    ],
  },
  4: {
    // 92
    1: [
      YellowDiamond(LEVEL_X - 40, LEVEL_Y - 580 + 40, 205, true), // crown
      YellowDiamond(LEVEL_X - 0, LEVEL_Y - 520 + 40, 250, true), // crown
      YellowDiamond(LEVEL_X - 120, LEVEL_Y - 580 + 40, 155, true), // crown
      YellowDiamond(LEVEL_X - 165, LEVEL_Y - 520 + 40, 110, true), // crown
      YellowDiamond(LEVEL_X - 150, LEVEL_Y + 70 + 40, 45, true), // front leg
      YellowDiamond(LEVEL_X + 150, LEVEL_Y + 70 + 40, 315, true), // back leg

      BlueHexagon(LEVEL_X - 50, LEVEL_Y - 300 + 40, 90, true),

      GreenEquilateralTriangle(LEVEL_X - 160, LEVEL_Y - 300 + 40, 270, true), // peak
      GreenEquilateralTriangle(LEVEL_X + 220, LEVEL_Y + 35 + 40, 180, true), // butt
      GreenEquilateralTriangle(LEVEL_X + 220, LEVEL_Y - 35 + 40, 0, true), // butt
      GreenEquilateralTriangle(LEVEL_X - 185, LEVEL_Y + 295 + 40, 0, true), // front foot
      GreenEquilateralTriangle(LEVEL_X + 255, LEVEL_Y + 295 + 40, 0, true), // back foot

      GreenTrapezoid(LEVEL_X - 150, LEVEL_Y - 110 + 40, 180, true), // body
      GreenTrapezoid(LEVEL_X - 150, LEVEL_Y + 40, 0, true), // body
      GreenTrapezoid(LEVEL_X + 10, LEVEL_Y - 110 + 40, 0, true), // body
      GreenTrapezoid(LEVEL_X + 10, LEVEL_Y + 40, 180, true), // body

      PurpleDiamond(LEVEL_X + 225, LEVEL_Y - 200 + 40, 180, true),
      PurpleDiamond(LEVEL_X + 225, LEVEL_Y - 0 + 40, 180, true),
      PurpleDiamond(LEVEL_X + 320, LEVEL_Y - 40 + 40, 120, true),
      PurpleDiamond(LEVEL_X + 320, LEVEL_Y - 150 + 40, 60, true),

      OrangeSquare(LEVEL_X - 100, LEVEL_Y - 215 + 40, 0, true),
    ],
    //103
    2: [
      PurpleDiamond(LEVEL_X - 320, LEVEL_Y - 170 - 100, 45, true),
      PurpleDiamond(LEVEL_X + 320, LEVEL_Y - 140 - 100, 325, true),

      YellowDiamond(LEVEL_X - 160, LEVEL_Y - 170 - 100, 135, true), // uppper arm left
      YellowDiamond(LEVEL_X + 200, LEVEL_Y - 160 - 100, 235, true), // upper arm right
      YellowDiamond(LEVEL_X - 160, LEVEL_Y + 165 - 100, 135, true), // lower arm left
      YellowDiamond(LEVEL_X + 200, LEVEL_Y + 170 - 100, 235, true), // lower arm right

      OrangeSquare(LEVEL_X - 60, LEVEL_Y - 300 - 100, 0, true), //top
      OrangeSquare(LEVEL_X + 60, LEVEL_Y - 300 - 100, 0, true), //top
      OrangeSquare(LEVEL_X - 60, LEVEL_Y + 10 - 100, 0, true), // body
      OrangeSquare(LEVEL_X + 60, LEVEL_Y + 10 - 100, 0, true), //body
      OrangeSquare(LEVEL_X - 60, LEVEL_Y + 320 - 100, 0, true), // lower body
      OrangeSquare(LEVEL_X + 60, LEVEL_Y + 320 - 100, 0, true), // lower body

      BlueRightTriangle(LEVEL_X + 160, LEVEL_Y - 400 - 100, 180, true), //horns
      BlueRightTriangle(LEVEL_X - 160, LEVEL_Y - 400 - 100, 270, true), //horns
      BlueRightTriangle(LEVEL_X - 60, LEVEL_Y - 100 - 100, 180, true), //shoulder
      BlueRightTriangle(LEVEL_X + 60, LEVEL_Y - 100 - 100, 270, true), //shoulders
      BlueRightTriangle(LEVEL_X - 60, LEVEL_Y + 120 - 100, 90, true),
      BlueRightTriangle(LEVEL_X + 60, LEVEL_Y + 120 - 100, 0, true),
      BlueRightTriangle(LEVEL_X - 60, LEVEL_Y + 210 - 100, 180, true),
      BlueRightTriangle(LEVEL_X + 60, LEVEL_Y + 210 - 100, 270, true),
      BlueRightTriangle(LEVEL_X - 60, LEVEL_Y + 430 - 100, 90, true),
      BlueRightTriangle(LEVEL_X + 60, LEVEL_Y + 430 - 100, 0, true),

      PinkQuarterCircle(LEVEL_X + 40, LEVEL_Y - 190 - 100, 90, true), //neck
      PinkQuarterCircle(LEVEL_X + 60, LEVEL_Y - 190 - 100, 0, true), //neck
    ],

    // 110
    3: [
      BlueHexagon(LEVEL_X + 150, LEVEL_Y - 450, 0, true),

      PurpleDiamond(LEVEL_X + 120, LEVEL_Y - 420, 119, true), // top head
      PurpleDiamond(LEVEL_X - 0, LEVEL_Y - 420, 119, true), // top middle
      PurpleDiamond(LEVEL_X - 120, LEVEL_Y - 420, 119, true), // top left
      PurpleDiamond(LEVEL_X + 180, LEVEL_Y - 320, 119, true), // middle right
      PurpleDiamond(LEVEL_X - 145, LEVEL_Y - 185, 0, true),
      PurpleDiamond(LEVEL_X - 240, LEVEL_Y - 135, 120, true),
      PurpleDiamond(LEVEL_X, LEVEL_Y - 230, 240, true), //
      PurpleDiamond(LEVEL_X + 210, LEVEL_Y - 110, 125, true), // bottom foot

      GreenEquilateralTriangle(LEVEL_X + 20, LEVEL_Y - 240, 60, true), // top
      GreenEquilateralTriangle(LEVEL_X - 35, LEVEL_Y - 215, 0, true), // middle
      GreenEquilateralTriangle(LEVEL_X - 35, LEVEL_Y - 155, 60, true), // bottom

      GreenTrapezoid(LEVEL_X - 265, LEVEL_Y - 305, 300, true), // upper back
      GreenTrapezoid(LEVEL_X + 240, LEVEL_Y - 335, 120, true), // upper front (hand)
      GreenTrapezoid(LEVEL_X + 100, LEVEL_Y - 170, 185, true),
    ],
  },
  5: {
    //111
    1: [
      BlueHexagon(LEVEL_X + 185, LEVEL_Y - 115, 30, true), // inner top right wing
      BlueHexagon(LEVEL_X - 180, LEVEL_Y - 115, 30, true), // inner top left wing
      BlueHexagon(LEVEL_X - 265, LEVEL_Y - 250, 30, true), // outer top left wing
      BlueHexagon(LEVEL_X + 265, LEVEL_Y - 250, 30, true), // outer top right wing
      BlueHexagon(LEVEL_X + 185, LEVEL_Y + 60, 30, true), // inner bottom right wing
      BlueHexagon(LEVEL_X - 180, LEVEL_Y + 60, 30, true), // inner bottom left wing
      BlueHexagon(LEVEL_X - 265, LEVEL_Y + 195, 30, true), // outer bottom left wing
      BlueHexagon(LEVEL_X + 265, LEVEL_Y + 195, 30, true), // outer bottom right wing
      BlueHexagon(LEVEL_X - 345, LEVEL_Y + 55, 30, true),
      BlueHexagon(LEVEL_X - 345, LEVEL_Y - 115, 30, true),
      BlueHexagon(LEVEL_X + 345, LEVEL_Y - 115, 30, true),
      BlueHexagon(LEVEL_X + 345, LEVEL_Y + 55, 30, true),

      PurpleDiamond(LEVEL_X - 50, LEVEL_Y - 450, 0, true), //head
      PurpleDiamond(LEVEL_X - 105, LEVEL_Y - 240, 30, true),
      PurpleDiamond(LEVEL_X - 0, LEVEL_Y - 240, 335, true),
      PurpleDiamond(LEVEL_X - 105, LEVEL_Y - 65, 150, true),
      PurpleDiamond(LEVEL_X - 5, LEVEL_Y - 65, 29, true),
      PurpleDiamond(LEVEL_X - 55, LEVEL_Y + 85, 90, true),
      PurpleDiamond(LEVEL_X - 0, LEVEL_Y + 180, 30, true),
      PurpleDiamond(LEVEL_X - 105, LEVEL_Y + 180, 330, true),

      GreenEquilateralTriangle(LEVEL_X - 55, LEVEL_Y - 235, 200, true), //neck left
      GreenEquilateralTriangle(LEVEL_X + 60, LEVEL_Y - 235, 280, true), //neck right
      GreenEquilateralTriangle(LEVEL_X - 30, LEVEL_Y - 50, 270, true),
      GreenEquilateralTriangle(LEVEL_X + 30, LEVEL_Y - 50, 90, true),
      GreenEquilateralTriangle(LEVEL_X - 60, LEVEL_Y + 125, 330, true),
      GreenEquilateralTriangle(LEVEL_X + 60, LEVEL_Y + 125, 30, true),
      GreenEquilateralTriangle(LEVEL_X - 123, LEVEL_Y - 25, 30, true),
      GreenEquilateralTriangle(LEVEL_X + 123, LEVEL_Y - 25, 330, true),
      GreenEquilateralTriangle(LEVEL_X + 242, LEVEL_Y - 28, 30, true),
      GreenEquilateralTriangle(LEVEL_X - 238, LEVEL_Y - 28, 330, true),

      YellowDiamond(LEVEL_X - 110, LEVEL_Y - 415, 310, true), // head left bottom
      YellowDiamond(LEVEL_X + 50, LEVEL_Y - 415, 50, true), // head right bottom
      YellowDiamond(LEVEL_X - 155, LEVEL_Y - 510, 310, true), // left top
      YellowDiamond(LEVEL_X + 95, LEVEL_Y - 510, 50, true), // right top
    ],

    //112
    2: [
      GreenTrapezoid(LEVEL_X - 97, LEVEL_Y - 290, 180, true),
      GreenTrapezoid(LEVEL_X - 97, LEVEL_Y - 185, 0, true),

      PinkQuarterCircle(LEVEL_X - 5, LEVEL_Y - 400, 180, true),
      PinkQuarterCircle(LEVEL_X + 5, LEVEL_Y - 400, 270, true),

      OrangeSquare(LEVEL_X + 130, LEVEL_Y - 185, 0, true),
      OrangeSquare(LEVEL_X - 225, LEVEL_Y - 185, 0, true),
      OrangeSquare(LEVEL_X - 102, LEVEL_Y + 70, 0, true),
      OrangeSquare(LEVEL_X + 10, LEVEL_Y + 70, 0, true),

      YellowDiamond(LEVEL_X + 210, LEVEL_Y + 10, 320, true),
      YellowDiamond(LEVEL_X + 280, LEVEL_Y - 20, 340, true),

      RedCircle(LEVEL_X - 50, LEVEL_Y - 395, 0, true),

      PurpleDiamond(LEVEL_X + 90, LEVEL_Y - 339, 120, true),
      PurpleDiamond(LEVEL_X - 193, LEVEL_Y - 339, 240, true),
      PurpleDiamond(LEVEL_X - 105, LEVEL_Y - 120, 150, true),
      PurpleDiamond(LEVEL_X + 5, LEVEL_Y - 120, 210, true),
      PurpleDiamond(LEVEL_X - 150, LEVEL_Y + 160, 30, true),
      PurpleDiamond(LEVEL_X + 50, LEVEL_Y + 160, 150, true),
      PurpleDiamond(LEVEL_X - 265, LEVEL_Y - 100, 30, true),
      PurpleDiamond(LEVEL_X + 170, LEVEL_Y - 100, 150, true),

      GreenEquilateralTriangle(LEVEL_X - 290, LEVEL_Y + 40, 30, true),
      GreenEquilateralTriangle(LEVEL_X - 200, LEVEL_Y + 90, 30, true),
      GreenEquilateralTriangle(LEVEL_X - 275, LEVEL_Y + 115, 330, true),
    ],

    //113
    3: [
      YellowDiamond(LEVEL_X + 15 - 80, LEVEL_Y - 600 + 100, 30, true),
      YellowDiamond(LEVEL_X + 50 - 80, LEVEL_Y - 465 + 100, 120, true),
      YellowDiamond(LEVEL_X - 80 - 80, LEVEL_Y - 600 + 100, 155, true),
      YellowDiamond(LEVEL_X - 125 - 80, LEVEL_Y - 470 + 100, 245, true),

      PurpleDiamond(LEVEL_X - 145 - 80, LEVEL_Y - 375 + 100, 60, true), //top
      PurpleDiamond(LEVEL_X - 205 - 80, LEVEL_Y - 275 + 100, 60, true), // bottom left
      PurpleDiamond(LEVEL_X + 105 - 80, LEVEL_Y - 275 + 100, 240, true),
      PurpleDiamond(LEVEL_X + 225 - 80, LEVEL_Y - 275 + 100, 240, true),
      PurpleDiamond(LEVEL_X + 345 - 80, LEVEL_Y - 275 + 100, 240, true),
      PurpleDiamond(LEVEL_X + 400 - 80, LEVEL_Y - 375 + 100, 240, true),

      GreenEquilateralTriangle(LEVEL_X - 80, LEVEL_Y - 360 + 100, 0, true), // top of the plane
      GreenEquilateralTriangle(LEVEL_X - 45 - 80, LEVEL_Y - 200 + 100, 0, true),
      GreenEquilateralTriangle(LEVEL_X - 30 - 80, LEVEL_Y - 50 + 100, 0, true),

      GreenTrapezoid(LEVEL_X - 235 - 80, LEVEL_Y - 120 + 100, 0, true), //left trap
      GreenTrapezoid(LEVEL_X - 25 - 80, LEVEL_Y - 120 + 100, 0, true), //right trap

      RedCircle(LEVEL_X - 205 - 80, LEVEL_Y - 20 + 100, 0, true),
      RedCircle(LEVEL_X - 80, LEVEL_Y - 20 + 100, 0, true),

      BlueHexagon(LEVEL_X + 50 - 80, LEVEL_Y - 250 + 100, 0, true), //top heaxagon
    ],
  },
  6: {
    //117
    1: [
      RedCircle(LEVEL_X + 135, LEVEL_Y - 200, 0, true),
      RedCircle(LEVEL_X + 135, LEVEL_Y - 90, 0, true),
      RedCircle(LEVEL_X - 235, LEVEL_Y - 200, 0, true),
      RedCircle(LEVEL_X - 235, LEVEL_Y - 90, 0, true),

      PinkQuarterCircle(LEVEL_X + 5, LEVEL_Y - 300, 0, true),
      PinkQuarterCircle(LEVEL_X - 5, LEVEL_Y - 300, 90, true),
      PinkQuarterCircle(LEVEL_X - 5, LEVEL_Y - 305, 180, true),
      PinkQuarterCircle(LEVEL_X + 5, LEVEL_Y - 305, 270, true),

      GreenTrapezoid(LEVEL_X - 15, LEVEL_Y - 150, 90, true),
      GreenTrapezoid(LEVEL_X - 185, LEVEL_Y - 150, 270, true),

      YellowDiamond(LEVEL_X - 35, LEVEL_Y - 200, 0, true),

      BlueRightTriangle(LEVEL_X + 25, LEVEL_Y - 500, 140, true),
      BlueRightTriangle(LEVEL_X - 125, LEVEL_Y - 500, 300, true),

      PinkQuarterCircle(LEVEL_X + 5, LEVEL_Y + 100, 0, true),
      PinkQuarterCircle(LEVEL_X - 5, LEVEL_Y + 100, 90, true),
      PinkQuarterCircle(LEVEL_X - 5, LEVEL_Y + 95, 180, true),
      PinkQuarterCircle(LEVEL_X + 5, LEVEL_Y + 95, 270, true),

      BlueRightTriangle(LEVEL_X + 25, LEVEL_Y + 180, 140, true),
      BlueRightTriangle(LEVEL_X - 115, LEVEL_Y + 180, 300, true),
    ],

    //124
    2: [
      BlueHexagon(LEVEL_X, LEVEL_Y - 400, 30, true),

      GreenTrapezoid(LEVEL_X - 100, LEVEL_Y - 180, 180, true),
      GreenTrapezoid(LEVEL_X - 100, LEVEL_Y - 75, 0, true),

      GreenEquilateralTriangle(LEVEL_X + 120, LEVEL_Y - 470, 0, true), //right top
      GreenEquilateralTriangle(LEVEL_X - 120, LEVEL_Y - 470, 0, true), //left top
      GreenEquilateralTriangle(LEVEL_X - 100, LEVEL_Y - 4, 0, true), //left lower bottom
      GreenEquilateralTriangle(LEVEL_X + 100, LEVEL_Y - 4, 0, true), //right lower bottom

      PurpleDiamond(LEVEL_X - 55, LEVEL_Y - 355, 90, true), // neck
      PurpleDiamond(LEVEL_X - 145, LEVEL_Y - 25, 242, true),
      PurpleDiamond(LEVEL_X + 50, LEVEL_Y - 25, 118, true),

      YellowDiamond(LEVEL_X + 70, LEVEL_Y - 310, 80, true), // right top
      YellowDiamond(LEVEL_X - 140, LEVEL_Y - 310, 280, true), // left top
    ],

    //127
    3: [
      GreenTrapezoid(LEVEL_X - 210, LEVEL_Y - 279, 120, true),
      GreenTrapezoid(LEVEL_X + 10, LEVEL_Y - 279, 240, true),

      YellowDiamond(LEVEL_X - 130, LEVEL_Y - 120, 70, true), // bottom top left
      YellowDiamond(LEVEL_X + 60, LEVEL_Y - 120, 110, true), // bottom top right
      YellowDiamond(LEVEL_X - 130, LEVEL_Y - 50, 110, true), // bottom middle left
      YellowDiamond(LEVEL_X + 60, LEVEL_Y - 50, 70, true), // bottom middle right
      YellowDiamond(LEVEL_X - 130, LEVEL_Y + 20, 70, true), // bottom bottom left
      YellowDiamond(LEVEL_X + 60, LEVEL_Y + 20, 110, true), // bottom bottom right
      YellowDiamond(LEVEL_X + 160, LEVEL_Y - 470, 40, true), // arm top right
      YellowDiamond(LEVEL_X - 240, LEVEL_Y - 335, 50, true), //arm top left
      YellowDiamond(LEVEL_X + 200, LEVEL_Y - 580, 40, true), // arm bottom right
      YellowDiamond(LEVEL_X - 290, LEVEL_Y - 240, 50, true), // arm bottom left

      BlueHexagon(LEVEL_X, LEVEL_Y - 450, 0, true),
      BlueHexagon(LEVEL_X, LEVEL_Y - 130, 0, true),

      GreenEquilateralTriangle(LEVEL_X, LEVEL_Y - 325, 0, true),
      GreenEquilateralTriangle(LEVEL_X, LEVEL_Y - 245, 0, true),
    ],
  },
  7: {
    //114
    1: [
      GreenEquilateralTriangle(LEVEL_X - 100, LEVEL_Y - 119, 0, true), // trinalge in between purple diamond and trapziod
      GreenEquilateralTriangle(LEVEL_X + 130, LEVEL_Y - 45, 180, true),
      GreenEquilateralTriangle(LEVEL_X + 245, LEVEL_Y - 115, 0, true),
      GreenEquilateralTriangle(LEVEL_X + 335, LEVEL_Y - 45, 180, true),

      PurpleDiamond(LEVEL_X - 240, LEVEL_Y - 240, 62, true), // top most left
      PurpleDiamond(LEVEL_X - 305, LEVEL_Y - 140, 62, true),
      PurpleDiamond(LEVEL_X - 20, LEVEL_Y - 130, 120, true), // hexagon right diamond
      PurpleDiamond(LEVEL_X + 100, LEVEL_Y - 235, 62, true), //upper tapziod left
      PurpleDiamond(LEVEL_X + 280, LEVEL_Y - 230, 120, true),

      YellowDiamond(LEVEL_X - 130, LEVEL_Y - 540, 70, true),
      YellowDiamond(LEVEL_X + 120, LEVEL_Y - 640, 70, true),

      BlueHexagon(LEVEL_X - 105, LEVEL_Y - 10, 0, true),
      BlueHexagon(LEVEL_X + 230, LEVEL_Y + 0, 0, true),

      GreenTrapezoid(LEVEL_X - 200, LEVEL_Y - 400, 0, true), //smoke peaker
      GreenTrapezoid(LEVEL_X - 95, LEVEL_Y - 187, 0, true), // lowest body trap
      GreenTrapezoid(LEVEL_X + 140, LEVEL_Y - 290, 180, true),

      OrangeSquare(LEVEL_X - 150, LEVEL_Y - 295, 0, true),
    ],

    //170
    2: [
      GreenTrapezoid(LEVEL_X + 180, LEVEL_Y - 365, 180, true), // top trapizod under top triangle
      GreenTrapezoid(LEVEL_X + 205, LEVEL_Y + 60, 0, true),
      GreenTrapezoid(LEVEL_X + 205, LEVEL_Y + 170, 180, true),
      GreenTrapezoid(LEVEL_X - 95, LEVEL_Y + 60, 0, true),
      GreenTrapezoid(LEVEL_X - 95, LEVEL_Y + 170, 180, true),

      OrangeSquare(LEVEL_X + 230, LEVEL_Y - 260, 0, true), // top square under top trapizod
      OrangeSquare(LEVEL_X + 280, LEVEL_Y - 50, 0, true), // most left square
      OrangeSquare(LEVEL_X + 170, LEVEL_Y - 50, 0, true), //  middle left square
      OrangeSquare(LEVEL_X + 60, LEVEL_Y - 50, 0, true), // middle right square
      OrangeSquare(LEVEL_X - 50, LEVEL_Y - 50, 0, true), // most right square

      PurpleDiamond(LEVEL_X + 190, LEVEL_Y - 205, 62, true), //top under top traingle
      /*PurpleDiamond(LEVEL_X , LEVEL_Y, 40, true),
      PurpleDiamond(LEVEL_X , LEVEL_Y, 40, true),
      PurpleDiamond(LEVEL_X , LEVEL_Y, 40, true),*/

      GreenEquilateralTriangle(LEVEL_X + 280, LEVEL_Y - 400, 0, true), //top triangle
      GreenEquilateralTriangle(LEVEL_X + 330, LEVEL_Y - 85, 0, true),
      GreenEquilateralTriangle(LEVEL_X - 0, LEVEL_Y - 80, 0, true), // left square on top of triangle

      BlueHexagon(LEVEL_X + 155, LEVEL_Y + 165, 0, true),
    ],

    //169
    3: [
      GreenTrapezoid(LEVEL_X - 160, LEVEL_Y - 110 + 100, 0, true),
      GreenTrapezoid(LEVEL_X - 100, LEVEL_Y - 0 + 100, 0, true),

      PurpleDiamond(LEVEL_X + 80, LEVEL_Y - 475 + 100, 120, true), //left top
      PurpleDiamond(LEVEL_X - 190, LEVEL_Y - 475 + 100, 60, true), // right top
      PurpleDiamond(LEVEL_X + 80, LEVEL_Y - 265 + 100, 60, true),
      PurpleDiamond(LEVEL_X - 190, LEVEL_Y - 265 + 100, 120, true),
      PurpleDiamond(LEVEL_X + 25, LEVEL_Y - 160 + 100, 60, true),

      GreenEquilateralTriangle(LEVEL_X, LEVEL_Y + 135 + 100, 60, true),

      YellowDiamond(LEVEL_X + 70, LEVEL_Y - 620 + 100, 30, true),
      YellowDiamond(LEVEL_X - 140, LEVEL_Y - 620 + 100, 150, true),
      YellowDiamond(LEVEL_X - 30, LEVEL_Y - 630 + 100, 0, true),

      OrangeSquare(LEVEL_X + 120, LEVEL_Y - 320 + 100, 0, true),
      OrangeSquare(LEVEL_X - 215, LEVEL_Y - 320 + 100, 0, true),

      BlueHexagon(LEVEL_X, LEVEL_Y - 350 + 100, 0, true),
      BlueHexagon(LEVEL_X, LEVEL_Y - 190 + 100, 0, true),
    ],
  },
  8: {
    //283
    1: [
      BlueHexagon(LEVEL_X + 250, LEVEL_Y - 450 + 100, 0, true),

      OrangeSquare(LEVEL_X + 50, LEVEL_Y + 140 + 100, 0, true),
      OrangeSquare(LEVEL_X - 60, LEVEL_Y + 140 + 100, 0, true),
      OrangeSquare(LEVEL_X - 170, LEVEL_Y + 140 + 100, 0, true),
      OrangeSquare(LEVEL_X + 50, LEVEL_Y + 30 + 100, 0, true),
      OrangeSquare(LEVEL_X - 60, LEVEL_Y + 30 + 100, 0, true),
      OrangeSquare(LEVEL_X - 170, LEVEL_Y + 30 + 100, 0, true),
      OrangeSquare(LEVEL_X - 120, LEVEL_Y - 300 + 100, 0, true),

      YellowDiamond(LEVEL_X - 160, LEVEL_Y - 490 + 100, 320, true),

      GreenEquilateralTriangle(LEVEL_X - 315, LEVEL_Y + 215 + 100, 0, true),
      GreenEquilateralTriangle(LEVEL_X - 220, LEVEL_Y + 215 + 100, 0, true),
      GreenEquilateralTriangle(LEVEL_X + 200, LEVEL_Y + 215 + 100, 0, true),
      GreenEquilateralTriangle(LEVEL_X + 305, LEVEL_Y + 215 + 100, 0, true),

      GreenEquilateralTriangle(LEVEL_X + 250, LEVEL_Y - 560 + 100, 0, true),
      GreenEquilateralTriangle(LEVEL_X + 250, LEVEL_Y - 340 + 100, 180, true),
      GreenEquilateralTriangle(LEVEL_X + 150, LEVEL_Y - 400 + 100, 120, true),
      GreenEquilateralTriangle(LEVEL_X + 150, LEVEL_Y - 500 + 100, 300, true),
      GreenEquilateralTriangle(LEVEL_X + 350, LEVEL_Y - 400 + 100, 120, true),
      GreenEquilateralTriangle(LEVEL_X + 350, LEVEL_Y - 500 + 100, 300, true),

      GreenEquilateralTriangle(LEVEL_X + 160, LEVEL_Y - 10 + 100, 0, true),
      GreenEquilateralTriangle(LEVEL_X - 175, LEVEL_Y - 10 + 100, 0, true),

      GreenTrapezoid(LEVEL_X - 110, LEVEL_Y - 80 + 100, 180, true),
      GreenTrapezoid(LEVEL_X - 110, LEVEL_Y - 190 + 100, 0, true),

      PurpleDiamond(LEVEL_X + 50, LEVEL_Y - 190 + 100, 0, true),
      PurpleDiamond(LEVEL_X - 180, LEVEL_Y - 190 + 100, 0, true),
    ],

    //231
    2: [
      BlueHexagon(LEVEL_X + 0, LEVEL_Y - 150, 30, true),

      GreenTrapezoid(LEVEL_X + 25, LEVEL_Y + 25, 150, true),
      GreenTrapezoid(LEVEL_X - 310, LEVEL_Y - 190, 270, true),
      GreenTrapezoid(LEVEL_X - 210, LEVEL_Y + 20, 210, true),
      GreenTrapezoid(LEVEL_X + 0, LEVEL_Y - 410, 30, true),
      GreenTrapezoid(LEVEL_X + 140, LEVEL_Y - 200, 90, true),
      GreenTrapezoid(LEVEL_X - 230, LEVEL_Y - 420, 330, true),

      YellowDiamond(LEVEL_X - 35, LEVEL_Y - 435, 0, true),
      YellowDiamond(LEVEL_X - 35, LEVEL_Y - 60, 0, true),
      YellowDiamond(LEVEL_X + 110, LEVEL_Y - 360, 45, true),
      YellowDiamond(LEVEL_X - 180, LEVEL_Y - 140, 45, true),
      YellowDiamond(LEVEL_X + 125, LEVEL_Y - 150, 125, true),
      YellowDiamond(LEVEL_X - 190, LEVEL_Y - 350, 125, true),

      RedCircle(LEVEL_X - 50, LEVEL_Y - 550, 0, true),
      RedCircle(LEVEL_X - 50, LEVEL_Y + 150, 0, true),
    ],

    //224
    3: [
      OrangeSquare(LEVEL_X + 20, LEVEL_Y - 370, 30, true),
      OrangeSquare(LEVEL_X - 120, LEVEL_Y - 370, 330, true),
      OrangeSquare(LEVEL_X + 90, LEVEL_Y - 250, 0, true),
      OrangeSquare(LEVEL_X - 190, LEVEL_Y - 250, 0, true),
      OrangeSquare(LEVEL_X + 20, LEVEL_Y - 130, 60, true),
      OrangeSquare(LEVEL_X - 120, LEVEL_Y - 130, 300, true),

      GreenEquilateralTriangle(LEVEL_X + 110, LEVEL_Y - 400, 30, true),
      GreenEquilateralTriangle(LEVEL_X - 120, LEVEL_Y - 400, 330, true),
      GreenEquilateralTriangle(LEVEL_X + 230, LEVEL_Y - 200, 90, true),
      GreenEquilateralTriangle(LEVEL_X - 230, LEVEL_Y - 200, 270, true),
      GreenEquilateralTriangle(LEVEL_X - 115, LEVEL_Y - 5, 90, true),
      GreenEquilateralTriangle(LEVEL_X + 125, LEVEL_Y - 0, 270, true),

      PurpleDiamond(LEVEL_X - 55, LEVEL_Y - 80, 0, true),
      PurpleDiamond(LEVEL_X - 55, LEVEL_Y - 520, 0, true),
      PurpleDiamond(LEVEL_X + 130, LEVEL_Y - 410, 60, true),
      PurpleDiamond(LEVEL_X - 250, LEVEL_Y - 190, 60, true),
      PurpleDiamond(LEVEL_X - 250, LEVEL_Y - 410, 120, true),
      PurpleDiamond(LEVEL_X + 135, LEVEL_Y - 190, 120, true),

      BlueHexagon(LEVEL_X, LEVEL_Y - 200, 30, true),

      RedCircle(LEVEL_X - 55, LEVEL_Y - 650, 0, true),
      RedCircle(LEVEL_X - 55, LEVEL_Y + 150, 0, true),
      RedCircle(LEVEL_X + 350, LEVEL_Y - 250, 0, true),
      RedCircle(LEVEL_X - 450, LEVEL_Y - 250, 0, true),
    ],
  },
  9: {
    //104
    1: [
      GreenTrapezoid(LEVEL_X - 95, LEVEL_Y - 310, 180, true),
      GreenTrapezoid(LEVEL_X - 95, LEVEL_Y - 200, 0, true),
      GreenTrapezoid(LEVEL_X - 95, LEVEL_Y + 80, 180, true),
      GreenTrapezoid(LEVEL_X - 95, LEVEL_Y + 190, 0, true),

      BlueHexagon(LEVEL_X, LEVEL_Y - 400, 0, true),
      BlueHexagon(LEVEL_X, LEVEL_Y - 10, 0, true),

      PurpleDiamond(LEVEL_X + 60, LEVEL_Y - 30, 0, true),
      PurpleDiamond(LEVEL_X + 60, LEVEL_Y - 430, 0, true),
      PurpleDiamond(LEVEL_X - 160, LEVEL_Y - 30, 0, true),
      PurpleDiamond(LEVEL_X - 160, LEVEL_Y - 420, 0, true),

      GreenEquilateralTriangle(LEVEL_X - 0, LEVEL_Y - 510, 0, true),
      GreenEquilateralTriangle(LEVEL_X, LEVEL_Y + 330, 60, true),

      RedCircle(LEVEL_X + 170, LEVEL_Y - 10, 0, true),
      RedCircle(LEVEL_X + 170, LEVEL_Y - 410, 0, true),
      RedCircle(LEVEL_X - 270, LEVEL_Y - 10, 0, true),
      RedCircle(LEVEL_X - 270, LEVEL_Y - 390, 0, true),
    ],

    //296 and 297
    2: [
      GreenEquilateralTriangle(LEVEL_X + 450, LEVEL_Y - 260, 0, true),
      GreenEquilateralTriangle(LEVEL_X - 250, LEVEL_Y - 260, 0, true),
      GreenEquilateralTriangle(LEVEL_X + 40, LEVEL_Y - 260, 0, true),
      GreenEquilateralTriangle(LEVEL_X + 40, LEVEL_Y - 480, 0, true),

      YellowDiamond(LEVEL_X - 320, LEVEL_Y + 100, 20, true),
      YellowDiamond(LEVEL_X - 240, LEVEL_Y + 100, 340, true),
      YellowDiamond(LEVEL_X + 380, LEVEL_Y + 100, 20, true),
      YellowDiamond(LEVEL_X + 470, LEVEL_Y + 100, 340, true),
      YellowDiamond(LEVEL_X - 30, LEVEL_Y + 200, 20, true),
      YellowDiamond(LEVEL_X + 60, LEVEL_Y + 200, 340, true),

      PurpleDiamond(LEVEL_X - 100, LEVEL_Y - 380, 60, true),
      PurpleDiamond(LEVEL_X + 70, LEVEL_Y - 380, 300, true),

      OrangeSquare(LEVEL_X + 100, LEVEL_Y, 0, true),
      OrangeSquare(LEVEL_X - 10, LEVEL_Y, 0, true),
      OrangeSquare(LEVEL_X - 120, LEVEL_Y, 0, true),
      OrangeSquare(LEVEL_X + 100, LEVEL_Y - 110, 0, true),
      OrangeSquare(LEVEL_X - 10, LEVEL_Y - 110, 0, true),
      OrangeSquare(LEVEL_X - 120, LEVEL_Y - 110, 0, true),
      OrangeSquare(LEVEL_X + 100, LEVEL_Y - 220, 0, true),
      OrangeSquare(LEVEL_X - 10, LEVEL_Y - 220, 0, true),
      OrangeSquare(LEVEL_X - 120, LEVEL_Y - 220, 0, true),

      OrangeSquare(LEVEL_X + 400, LEVEL_Y, 0, true),
      OrangeSquare(LEVEL_X + 400, LEVEL_Y - 110, 0, true),
      OrangeSquare(LEVEL_X + 400, LEVEL_Y - 220, 0, true),

      OrangeSquare(LEVEL_X - 300, LEVEL_Y, 0, true),
      OrangeSquare(LEVEL_X - 300, LEVEL_Y - 110, 0, true),
      OrangeSquare(LEVEL_X - 300, LEVEL_Y - 220, 0, true),

      GreenTrapezoid(LEVEL_X - 60, LEVEL_Y - 440, 180, true),
      GreenTrapezoid(LEVEL_X - 50, LEVEL_Y + 110, 0, true),
    ],

    //dragonfly
    3: [
      RedCircle(LEVEL_X, LEVEL_Y - 410, 0, true),
      RedCircle(LEVEL_X, LEVEL_Y - 310, 0, true),
      RedCircle(LEVEL_X - 30, LEVEL_Y - 210, 0, true),

      GreenEquilateralTriangle(LEVEL_X + 50, LEVEL_Y + 60, 0, true),
      GreenEquilateralTriangle(LEVEL_X + 50, LEVEL_Y + 350, 60, true),

      YellowDiamond(LEVEL_X + 120, LEVEL_Y - 520, 60, true),
      YellowDiamond(LEVEL_X + 120, LEVEL_Y - 420, 310, true),
      YellowDiamond(LEVEL_X - 100, LEVEL_Y - 520, 310, true),
      YellowDiamond(LEVEL_X - 100, LEVEL_Y - 420, 60, true),

      PurpleDiamond(LEVEL_X - 100, LEVEL_Y - 200, 40, true),

      PurpleDiamond(LEVEL_X - 120, LEVEL_Y + 200, 30, true),
      PurpleDiamond(LEVEL_X + 110, LEVEL_Y + 200, 330, true),

      OrangeSquare(LEVEL_X, LEVEL_Y + 100, 0, true),
      OrangeSquare(LEVEL_X, LEVEL_Y + 210, 0, true),

      BlueHexagon(LEVEL_X - 90, LEVEL_Y + 150, 30, true),
      BlueHexagon(LEVEL_X + 190, LEVEL_Y + 150, 30, true),
    ],
  },

  // 4: {
  //   //Level 4-1
  //   1: [
  //     OrangeSquare(LEVEL_X, LEVEL_Y, 0, true), //First Shape
  //     OrangeSquare(LEVEL_X, LEVEL_Y - 110, 0, true), //Second Shape
  //     GreenTrapezoid(LEVEL_X - 160, LEVEL_Y - 50, 90, true), // Third Shape
  //     GreenEquilateralTriangle(LEVEL_X - 145, LEVEL_Y, 30, true), // Fourth Shape
  //   ],
  // },
};

//====================================
//          Building Blocks
//====================================

//Shapes on the left side of the screen, the cannot be dragged but will create a new instance
//Of the block that you can drag
const building_blocks = [
  GreenEquilateralTriangle((canvas.width * 0.25) / 4, 80, 0, false, true),
  OrangeSquare((canvas.width * 0.55) / 4 - 20, 20, 0, false, true),

  RedCircle((canvas.width * 0.25) / 10, 180, 0, false, true),
  GreenTrapezoid((canvas.width * 0.25) / 4 + 70, 180, 180, false, true),

  BlueHexagon((canvas.width * 0.25) / 2 + 80, 420, 180, false, true),
  PurpleDiamond((canvas.width * 0.25) / 2 - 170, 330, 40, false, true),

  BlueRightTriangle((canvas.width * 0.25) / 4 - 50, 580, 0, false, true),
  YellowDiamond((canvas.width * 0.25) / 2 + 30, 530, 140, false, true),

  PinkQuarterCircle((canvas.width * 0.25) / 2 - 60, 750, 0, false, true),
];
