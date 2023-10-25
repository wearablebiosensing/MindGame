//====================================
//          Building Blocks
//====================================

//Shapes on the left side of the screen, the cannto be dragged but will create a new instance
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
    2: [],

    //Tortoise
    3: [],
  },
};
