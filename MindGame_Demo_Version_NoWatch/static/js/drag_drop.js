class Shape {
  /**
   * Creates a new Shape instance.
   * @param {number} x - The x-coordinate of the shape.
   * @param {number} y - The y-coordinate of the shape.
   * @param {string} color - The color of the shape.
   * @param {number} rotation - The rotation angle of the shape.
   * @param {boolean} isLevelShape - Flag to indicate if it's a special shape.
   * @param {boolean} [isBuildingBlock=false] - Flag to indicate if it's a building block.
   */
  constructor(x, y, color, rotation, isLevelShape, isBuildingBlock = false) {
    this.x = x;
    this.y = y;
    this.color = color;
    // color when the shapes are done matching.
    this.doneColor = "#478F96";
    this.rotation = 0; //Maybe this.rotation = rotate(rotation)
    this.rotate(rotation);
    this.isDragging = false;
    this.startX = 0;
    this.startY = 0;
    this.isLevelShape = isLevelShape; // Flag to indicate if it's a special shape
    this.isLevelShapeFilled = false; //Flag to indicate if a level shape is already filled
    this.isSnapped = false; // Flag to track if a shape is snapped to this target
    this.snapDistanceThreshold = 50; //Flag to indicate how close a shape must be to Level shape to snap to it

    this.isBuildingBlock = isBuildingBlock;

    // Trying to make deleting shapes work
    this.dragStartX = 0;
    this.dragStartY = 0;
  }

  /**
   * Rotates the shape by the specified degree.
   * @param {number} degree - The degree by which to rotate the shape.
   */
  rotate(degree) {
    this.rotation = (this.rotation + degree) % 360;
    if (this.rotation < 0) {
      this.rotation += 360;
    }
  }

  /**
   * Checks if the rotation of this shape is within a certain threshold of another shape's rotation.
   * @param {Shape} targetShape - The target shape to compare rotations with.
   * @param {number[]} [equivalentRotations=[0]] - An array of equivalent rotations to check against.
   * @returns {boolean} True if the rotations are within the threshold, false otherwise.
   */
  checkRotationThreshold(targetShape, equivalentRotations = [0]) {
    const rotationDifference = Math.abs(this.rotation - targetShape.rotation);
    const rotationThreshold = 340;

    for (const angle of equivalentRotations) {
      const difference = Math.abs(rotationDifference - angle);
      const wrappedDifference = Math.abs(360 - difference);

      if (
        difference <= rotationThreshold ||
        wrappedDifference <= rotationThreshold
      ) {
        return true;
      }
    }

    return false;
  }

  /**
   * Creates a shape from a building block (abstract method, to be implemented in specific shape classes).
   */
  createShapeFromBlock() {
    // Abstract method - to be implemented in specific shape classes
  }

  /**
   * Draws the shape (abstract method, to be implemented in specific shape classes).
   */
  draw() {
    // Abstract method - to be implemented in specific shape classes
  }

  // Abstract method:
  /**
   * Determines if a point (x, y) is inside the bounds of the shape.
   * @param {number} x - The x-coordinate of the point.
   * @param {number} y - The y-coordinate of the point.
   * @returns {boolean} True if the point is inside the shape's bounds, false otherwise.
   */
  isPointInside(x, y) {
    return false;
  }

  //Checks to see if dragged shape and target shape
  //are both instances of the same object, are within
  //both a distance & rotation threshold
  /**
   * Snaps this shape to a target shape if conditions are met.
   * @param {Shape} targetShape - The target shape to snap to.
   */
  snapToTargetShape(targetShape) {}

  // Since we now allow shapes to be dragged back to their
  // Building blocks to be removed, we need a way to determine
  // if we can snap the shape back to its building block. Otherwise
  // we would never be able to move shapes away from the building blocks
  // since it always would snap back as soon as it is created. This checks if the start
  // dragging point of the shape is outside of the snapdistance of the building block to allow this
  /**
   * Checks if this shape can be moved back to its original position (building block).
   * @param {Shape} targetShape - The target shape to check against.
   * @param {number} [thresholdOffset=10] - The threshold offset value.
   * @returns {boolean} True if the shape can be moved back to its original position, false otherwise.
   */
  canMoveShapeBackToOrigin(targetShape, thresholdOffset = 10) {
    if (targetShape.isBuildingBlock) {
      const dx = Math.abs(this.dragStartX - targetShape.x);
      const dy = Math.abs(this.dragStartY - targetShape.y);
      const threshold = this.snapDistanceThreshold + thresholdOffset;

      console.log(
        "SnapOrigin:  dx - ",
        dx,
        "   dy - ",
        dy,
        "   thresh - ",
        threshold
      );

      if (dx > threshold || dy > threshold) {
        // this.canSnapBack = false; // The shape can't snap back yet
        return false;
      } else {
        // this.canSnapBack = true; // The shape can snap back
        return true;
      }
    }

    return false;
  }

  /**
   * Gets the distance to another shape.
   * @param {Shape} targetShape - The target shape to calculate the distance to.
   * @returns {number} The distance to the target shape.
   */
  getDistanceToShape(targetShape) {
    //This is what a few shapes use so I set this as default
    //Others can overide
    const distance = Math.sqrt(
      Math.pow(this.x - targetShape.x, 2) + Math.pow(this.y - targetShape.y, 2)
    );

    return distance;
  }

  //A helper function that gets called if
  //snapToTargetShape passes all conditions
  /**
   * Handles the snap update when this shape is snapped to a target shape.
   * @param {Shape} targetShape - The target shape that this shape is snapped to.
   */
  snapUpdate(targetShape) {
    if (targetShape.isBuildingBlock) {
      console.log("Snap is BuildingBlock");
      this.rotation = targetShape.rotation;
      this.mouseUp();
      return;
    }

    this.isSnapped = true;
    targetShape.isLevelShapeFilled = true;
    this.rotation = targetShape.rotation;
    this.mouseUp();
  }

  /**
   * Handles the mouse down event.
   * @param {number} x - The x-coordinate of the mouse event.
   * @param {number} y - The y-coordinate of the mouse event.
   */
  mouseDown(x, y) {
    this.isDragging = true;
    this.startX = x;
    this.startY = y;

    this.dragStartX = x;
    this.dragStartY = y;
  }

  mouseUp() {
    this.isDragging = false;
  }

  /**
   * Handles the mouse move event.
   * @param {number} x - The x-coordinate of the mouse event.
   * @param {number} y - The y-coordinate of the mouse event.
   */
  mouseMove(x, y) {
    if (this.isDragging) {
      console.log("MOVING");
      const dx = x - this.startX;
      const dy = y - this.startY;

      this.x += dx;
      this.y += dy;

      this.startX = x;
      this.startY = y;
    }
  }
}

class Square extends Shape {
  constructor(
    x,
    y,
    width,
    height,
    color,
    rotation = 0,
    isLevelShape = false,
    isBuildingBlock = false
  ) {
    super(x, y, color, rotation, isLevelShape, isBuildingBlock);
    this.width = width;
    this.height = height;
    this.type = "Square";
  }

  createShapeFromBlock() {
    if (!this.isBuildingBlock) return;
    return OrangeSquare(this.x, this.y);
  }

  draw() {
    // ctx.fillStyle = this.isSnapped ? "green" : this.color;
    //ctx.globalAlpha = this.isSnapped ? 0.5 : 1; //Adjust transparency;
    // ctx.fillRect(this.x, this.y, this.width, this.height);
    //ctx.globalAlpha = 1; // Reset the global alpha value

    ctx.save(); // Save the current transformation state
    ctx.translate(this.x + this.width / 2, this.y + this.height / 2); // Translate the coordinate system to the center of the square
    ctx.rotate((Math.PI / 180) * this.rotation); // Rotate the coordinate system by the specified angle
    ctx.fillStyle = this.isSnapped ? this.doneColor : this.color;
    ctx.fillRect(-this.width / 2, -this.height / 2, this.width, this.height); // Draw the square centered at the translated coordinates
    ctx.restore(); // Restore the previous transformation state
  }

  snapToTargetShape(targetShape) {
    //Prevents an already filled tile shape from being use again
    if (targetShape.isLevelShapeFilled) return;

    if (targetShape instanceof Square) {
      // Snap Square shape to target Square shape if they are close enough

      if (!this.checkRotationThreshold(targetShape, [0, 90, 180, 270, 360]))
        return;

      const distance = Math.sqrt(
        Math.pow(this.x - targetShape.x, 2) +
          Math.pow(this.y - targetShape.y, 2)
      );

      if (this.canMoveShapeBackToOrigin(targetShape, 50)) {
        return;
      }

      if (distance <= this.snapDistanceThreshold) {
        this.x = targetShape.x;
        this.y = targetShape.y;
        this.snapUpdate(targetShape);
      }
    }
  }

  isPointInside(x, y) {
    let shape_left = this.x;
    let shape_right = this.x + this.width;
    let shape_top = this.y;
    let shape_bottom = this.y + this.height;

    return (
      x > shape_left && x < shape_right && y > shape_top && y < shape_bottom
    );
  }
}

class Circle extends Shape {
  constructor(
    x,
    y,
    radius,
    color,
    rotation = 0,
    isLevelShape = false,
    isBuildingBlock = false
  ) {
    super(
      x + radius, //So that Circle is drawn from top left instead of center
      y + radius,
      color,
      rotation,
      isLevelShape,
      isBuildingBlock
    );
    this.radius = radius;
    this.type = "Circle";
  }

  draw() {
    ctx.beginPath();
    ctx.fillStyle = this.isSnapped ? this.doneColor : this.color;
    ctx.arc(this.x, this.y, this.radius, 0, 2 * Math.PI);
    ctx.fill();
    ctx.closePath();
  }

  createShapeFromBlock() {
    if (!this.isBuildingBlock) return;
    console.log("Red");
    return RedCircle(this.x - this.radius, this.y - this.radius);
  }

  snapToTargetShape(targetShape) {
    //Prevents an already filled tile shape from being use again
    if (targetShape.isLevelShapeFilled) return;

    if (targetShape instanceof Circle) {
      // Snap Circle shape to target Circle shape if they are close enough

      const distance = Math.sqrt(
        Math.pow(this.x - targetShape.x, 2) +
          Math.pow(this.y - targetShape.y, 2)
      );

      //Dont Snap To Buildiong Block if dragStartX is too close to building block
      if (this.canMoveShapeBackToOrigin(targetShape)) {
        return;
      }

      if (distance <= this.snapDistanceThreshold) {
        this.x = targetShape.x;
        this.y = targetShape.y;
        this.snapUpdate(targetShape);
      }
    }
  }

  isPointInside(x, y) {
    return (
      Math.pow(this.x - x, 2) + Math.pow(this.y - y, 2) <=
      Math.pow(this.radius, 2)
    );
  }
}

class Trapezoid extends Shape {
  constructor(
    x,
    y,
    base,
    height,
    color,
    rotation = 0,
    isLevelShape = false,
    isBuildingBlock = false
  ) {
    super(
      x + base / 2,
      y + height / 2,
      color,
      rotation,
      isLevelShape,
      isBuildingBlock
    );
    this.base = base;
    this.height = height;
    this.type = "Trapezoid";
  }

  draw() {
    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.rotate((Math.PI / 180) * this.rotation);

    const topWidth = this.base; //*0.75
    const bottomWidth = this.base * 0.5;
    const halfHeight = this.height / 2;

    ctx.beginPath();
    ctx.moveTo(-topWidth / 2, -halfHeight);
    ctx.lineTo(topWidth / 2, -halfHeight);
    ctx.lineTo(bottomWidth / 2, halfHeight);
    ctx.lineTo(-bottomWidth / 2, halfHeight);
    ctx.closePath();

    ctx.fillStyle = this.isSnapped ? this.doneColor : this.color;
    ctx.fill();

    ctx.restore();
  }

  createShapeFromBlock() {
    if (!this.isBuildingBlock) return;
    return GreenTrapezoid(this.x - this.base / 2, this.y - this.height / 2);
  }

  snapToTargetShape(targetShape) {
    if (targetShape.isLevelShapeFilled) return;

    if (targetShape instanceof Trapezoid) {
      // if (this.rotation % 360 !== targetShape.rotation % 360) return;
      if (!this.checkRotationThreshold(targetShape)) return;

      const distance = Math.sqrt(
        Math.pow(this.x - targetShape.x, 2) +
          Math.pow(this.y - targetShape.y, 2)
      );

      //Dont Snap To Buildiong Block if dragStartX is too close to building block
      if (this.canMoveShapeBackToOrigin(targetShape)) {
        return;
      }

      if (distance <= this.snapDistanceThreshold) {
        this.x = targetShape.x;
        this.y = targetShape.y;
        this.snapUpdate(targetShape);
      }
    }
  }

  mouseMove(x, y) {
    if (this.isDragging) {
      const dx = x - this.startX;
      const dy = y - this.startY;

      this.x += dx;
      this.y += dy;
      this.startX = x;
      this.startY = y;
    }
  }

  isPointInside(mouseX, mouseY) {
    const { x, y, base, height, rotation } = this;
    const halfHeight = height / 2;

    // Adjust mouse coordinates based on rotation and translation
    const cosTheta = Math.cos((Math.PI / 180) * rotation);
    const sinTheta = Math.sin((Math.PI / 180) * rotation);
    const translatedX = mouseX - x;
    const translatedY = mouseY - y;
    const rotatedX = translatedX * cosTheta + translatedY * sinTheta;
    const rotatedY = translatedY * cosTheta - translatedX * sinTheta;

    // Calculate the boundaries of the trapezoid at the rotated position
    const topWidth = base * 0.75;
    const bottomWidth = base * 0.25;
    const topBoundary = -halfHeight;
    const bottomBoundary = halfHeight;

    // Check if the point is within the boundaries
    return (
      rotatedY >= topBoundary &&
      rotatedY <= bottomBoundary &&
      rotatedX >= -topWidth / 2 &&
      rotatedX <= topWidth / 2
    );
  }
}

class RightTriangle extends Shape {
  constructor(
    x,
    y,
    base,
    height,
    color,
    rotation = 0,
    isLevelShape = false,
    isBuildingBlock = false
  ) {
    super(x, y, color, rotation, isLevelShape, isBuildingBlock);
    this.base = base;
    this.height = height;
    this.x1 = x;
    this.y1 = y;
    this.x2 = x + base;
    this.y2 = y;
    this.x3 = x;
    this.y3 = y + height;
    this.type = "Right Triangle";
  }

  draw() {
    ctx.save(); // Save the current transformation state

    ctx.translate(this.x + this.base / 2, this.y + this.height / 2); // Translate the coordinate system to the center of the right triangle
    ctx.rotate((Math.PI / 180) * this.rotation); // Rotate the coordinate system by the specified angle

    ctx.beginPath();
    ctx.moveTo(-this.base / 2, -this.height / 2);
    ctx.lineTo(this.base / 2, -this.height / 2);
    ctx.lineTo(-this.base / 2, this.height / 2);
    ctx.closePath();

    ctx.fillStyle = this.isSnapped ? this.doneColor : this.color;
    ctx.fill();

    ctx.restore(); // Restore the previous transformation state
  }

  createShapeFromBlock() {
    if (!this.isBuildingBlock) return;
    return BlueRightTriangle(this.x, this.y);
  }

  snapToTargetShape(targetShape) {
    //Prevents an already filled tile shape from being use again
    if (targetShape.isLevelShapeFilled) return;

    if (targetShape instanceof RightTriangle) {
      if (!this.checkRotationThreshold(targetShape)) return;

      // Snap RightTriangle shape to target RightTriangle shape if they are close enough

      // Calculate the distance between the centers of the triangles
      const centerX = this.x + (this.x1 + this.x2) / 2;
      const centerY = this.y + (this.y1 + this.y3) / 2;
      const targetCenterX =
        targetShape.x + (targetShape.x1 + targetShape.x2) / 2;
      const targetCenterY =
        targetShape.y + (targetShape.y1 + targetShape.y3) / 2;
      const distance = Math.sqrt(
        Math.pow(centerX - targetCenterX, 2) +
          Math.pow(centerY - targetCenterY, 2)
      );

      //Dont Snap To Buildiong Block if dragStartX is too close to building block
      if (this.canMoveShapeBackToOrigin(targetShape)) {
        return;
      }

      if (distance <= this.snapDistanceThreshold) {
        // Snap the RightTriangle shape to the target RightTriangle shape
        const dx = targetShape.x - this.x;
        const dy = targetShape.y - this.y;
        this.x += dx;
        this.y += dy;
        this.x1 += dx;
        this.y1 += dy;
        this.x2 += dx;
        this.y2 += dy;
        this.x3 += dx;
        this.y3 += dy;

        this.snapUpdate(targetShape);
      }
    }
  }

  mouseMove(x, y) {
    if (this.isDragging) {
      const dx = x - this.startX;
      const dy = y - this.startY;

      this.x += dx;
      this.y += dy;
      this.x1 += dx;
      this.y1 += dy;
      this.x2 += dx;
      this.y2 += dy;
      this.x3 += dx;
      this.y3 += dy;

      this.startX = x;
      this.startY = y;
    }
  }

  isPointInside(mouseX, mouseY) {
    const { x1, y1, x2, y2, x3, y3 } = this;

    // Calculate the vectors from each vertex to the mouse position
    const vector1 = { x: mouseX - x1, y: mouseY - y1 };
    const vector2 = { x: mouseX - x2, y: mouseY - y2 };
    const vector3 = { x: mouseX - x3, y: mouseY - y3 };

    // Calculate the dot products of the vectors
    const dotProduct1 = vector1.x * (x2 - x1) + vector1.y * (y2 - y1);
    const dotProduct2 = vector2.x * (x3 - x2) + vector2.y * (y3 - y2);
    const dotProduct3 = vector3.x * (x1 - x3) + vector3.y * (y1 - y3);

    // Check if the dot products have the same sign
    const isInside = dotProduct1 >= 0 && dotProduct2 >= 0 && dotProduct3 >= 0;

    return isInside;
  }
}

class Diamond extends Shape {
  constructor(
    x,
    y,
    width,
    height,
    color,
    rotation = 0,
    isLevelShape = false,
    isBuildingBlock = false,
    type = null
  ) {
    super(x, y, color, rotation, isLevelShape, isBuildingBlock);
    this.width = width;
    this.height = height;
    this.type = type == "yellow" ? "Yellow Diamond" : "Purple Diamond"; //String to determined if it is the yellow or purple diamond
  }

  draw() {
    ctx.save();
    ctx.translate(this.x + this.width / 2, this.y + this.height / 2);
    ctx.rotate((Math.PI / 180) * this.rotation);
    ctx.fillStyle = this.isSnapped ? this.doneColor : this.color;
    ctx.beginPath();
    ctx.moveTo(-this.width / 2, 0);
    ctx.lineTo(0, -this.height / 2);
    ctx.lineTo(this.width / 2, 0);
    ctx.lineTo(0, this.height / 2);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }

  createShapeFromBlock() {
    if (!this.isBuildingBlock) return;
    return this.type == "Yellow Diamond"
      ? YellowDiamond(this.x, this.y, 90)
      : PurpleDiamond(this.x, this.y, 90);
    _;
  }

  snapToTargetShape(targetShape) {
    if (targetShape.isLevelShapeFilled) return;

    if (targetShape instanceof Diamond) {
      //Since There are two different diamond shapes
      if (this.width != targetShape.width) return;

      // const equivalentRotations = [0, 90, 180, 270];
      if (!this.checkRotationThreshold(targetShape, [0, 180])) return;

      const distance = Math.sqrt(
        Math.pow(this.x - targetShape.x, 2) +
          Math.pow(this.y - targetShape.y, 2)
      );

      //Dont Snap To Buildiong Block if dragStartX is too close to building block
      if (this.canMoveShapeBackToOrigin(targetShape, 60)) {
        return;
      }

      if (distance <= this.snapDistanceThreshold) {
        this.x = targetShape.x;
        this.y = targetShape.y;
        this.snapUpdate(targetShape);
      }
    }
  }

  isPointInside(x, y) {
    const centerX = this.x + this.width / 2;
    const centerY = this.y + this.height / 2;

    // Adjust the point coordinates based on rotation and center of the diamond
    const rotatedX =
      Math.cos((this.rotation * Math.PI) / 180) * (x - centerX) -
      Math.sin((this.rotation * Math.PI) / 180) * (y - centerY);
    const rotatedY =
      Math.sin((this.rotation * Math.PI) / 180) * (x - centerX) +
      Math.cos((this.rotation * Math.PI) / 180) * (y - centerY);

    // Check if the adjusted point is inside the diamond
    return (
      Math.abs(rotatedX) / (this.width / 2) +
        Math.abs(rotatedY) / (this.height / 2) <=
      1
    );
  }
}

class EquilateralTriangle extends Shape {
  constructor(
    x,
    y,
    sideLength,
    color,
    rotation = 0,
    isLevelShape = false,
    isBuildingBlock = false
  ) {
    super(x, y, color, rotation, isLevelShape, isBuildingBlock);
    this.sideLength = sideLength;
    this.height = (Math.sqrt(3) / 2) * sideLength;
    this.x1 = x - sideLength / 2;
    this.y1 = y + (Math.sqrt(3) / 6) * sideLength;
    this.x2 = x + sideLength / 2;
    this.y2 = y + (Math.sqrt(3) / 6) * sideLength;
    this.x3 = x;
    this.y3 = y - (Math.sqrt(3) / 3) * sideLength;
    this.type = "Equilateral Triangle";
  }

  draw() {
    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.rotate((Math.PI / 180) * this.rotation);

    ctx.beginPath();
    ctx.moveTo(-this.sideLength / 2, (Math.sqrt(3) / 6) * this.sideLength);
    ctx.lineTo(this.sideLength / 2, (Math.sqrt(3) / 6) * this.sideLength);
    ctx.lineTo(0, -(Math.sqrt(3) / 3) * this.sideLength);
    ctx.closePath();

    ctx.fillStyle = this.isSnapped ? this.doneColor : this.color;
    ctx.fill();

    ctx.restore();
  }

  createShapeFromBlock() {
    if (!this.isBuildingBlock) return;
    return GreenEquilateralTriangle(this.x, this.y);
  }

  snapToTargetShape(targetShape) {
    // Prevents an already filled tile shape from being used again
    if (targetShape.isLevelShapeFilled) return;

    if (targetShape instanceof EquilateralTriangle) {
      if (!this.checkRotationThreshold(targetShape, [0, 120, 240])) return;

      // Snap EquilateralTriangle shape to target EquilateralTriangle shape if they are close enough

      // Calculate the distance between the centers of the triangles
      const centerX = this.x;
      const centerY = this.y - (Math.sqrt(3) / 6) * this.sideLength;
      const targetCenterX = targetShape.x;
      const targetCenterY =
        targetShape.y - (Math.sqrt(3) / 6) * targetShape.sideLength;
      const distance = Math.sqrt(
        Math.pow(centerX - targetCenterX, 2) +
          Math.pow(centerY - targetCenterY, 2)
      );

      //Dont Snap To Buildiong Block if dragStartX is too close to building block
      if (this.canMoveShapeBackToOrigin(targetShape)) {
        return;
      }

      if (distance <= this.snapDistanceThreshold) {
        // Snap the EquilateralTriangle shape to the target EquilateralTriangle shape
        const dx = targetShape.x - this.x;
        const dy = targetShape.y - this.y;
        this.x += dx;
        this.y += dy;
        this.x1 += dx;
        this.y1 += dy;
        this.x2 += dx;
        this.y2 += dy;
        this.x3 += dx;
        this.y3 += dy;

        this.snapUpdate(targetShape);
      }
    }
  }

  mouseMove(x, y) {
    if (this.isDragging) {
      const dx = x - this.startX;
      const dy = y - this.startY;

      this.x += dx;
      this.y += dy;
      this.x1 += dx;
      this.y1 += dy;
      this.x2 += dx;
      this.y2 += dy;
      this.x3 += dx;
      this.y3 += dy;

      this.startX = x;
      this.startY = y;
    }
  }

  dotProduct(v1, v2) {
    return v1[0] * v2[0] + v1[1] * v2[1];
  }

  isPointInside(mouseX, mouseY) {
    const { x1, y1, x2, y2, x3, y3 } = this;

    const v0 = [x3 - x1, y3 - y1];
    const v1 = [x2 - x1, y2 - y1];
    const v2 = [mouseX - x1, mouseY - y1];

    const dot00 = this.dotProduct(v0, v0);
    const dot01 = this.dotProduct(v0, v1);
    const dot02 = this.dotProduct(v0, v2);
    const dot11 = this.dotProduct(v1, v1);
    const dot12 = this.dotProduct(v1, v2);

    const invDenom = 1 / (dot00 * dot11 - dot01 * dot01);
    const u = (dot11 * dot02 - dot01 * dot12) * invDenom;
    const v = (dot00 * dot12 - dot01 * dot02) * invDenom;

    return u >= 0 && v >= 0 && u + v < 1;
  }
}

class Hexagon extends Shape {
  constructor(
    x,
    y,
    sideLength,
    color,
    rotation = 0,
    isLevelShape = false,
    isBuildingBlock = false
  ) {
    super(x, y, color, rotation, isLevelShape, isBuildingBlock);
    this.sideLength = sideLength;
    this.radius = (sideLength * Math.sqrt(3)) / 2;
    this.type = "Hexagon";
  }

  draw() {
    ctx.save(); // Save the current transformation state
    ctx.translate(this.x, this.y); // Translate the coordinate system to the center of the hexagon
    ctx.rotate((Math.PI / 180) * this.rotation); // Rotate the coordinate system by the specified angle

    ctx.beginPath();
    ctx.moveTo(this.radius, 0);
    for (let i = 1; i <= 6; i++) {
      const angle = (Math.PI / 180) * (60 * i);
      const x = this.radius * Math.cos(angle);
      const y = this.radius * Math.sin(angle);
      ctx.lineTo(x, y);
    }
    ctx.closePath();

    ctx.fillStyle = this.isSnapped ? this.doneColor : this.color;
    ctx.fill();

    ctx.restore(); // Restore the previous transformation state
  }

  createShapeFromBlock() {
    if (!this.isBuildingBlock) return;
    return BlueHexagon(this.x, this.y);
  }

  snapToTargetShape(targetShape) {
    // Prevents an already filled tile shape from being used again
    if (targetShape.isLevelShapeFilled) return;

    if (targetShape instanceof Hexagon) {
      // Snap Hexagon shape to target Hexagon shape if they are close enough

      if (
        !this.checkRotationThreshold(
          targetShape,
          [0, 60, 120, 180, 240, 300, 360]
        )
      )
        return;

      const distance = Math.sqrt(
        Math.pow(this.x - targetShape.x, 2) +
          Math.pow(this.y - targetShape.y, 2)
      );

      //Dont Snap To Buildiong Block if dragStartX is too close to building block
      if (this.canMoveShapeBackToOrigin(targetShape)) {
        console.log("RETT");
        return;
      }

      console.log("HEXDIS - ", distance <= this.snapDistanceThreshold);

      if (distance <= this.snapDistanceThreshold) {
        console.log("GOOD");
        this.x = targetShape.x;
        this.y = targetShape.y;
        this.snapUpdate(targetShape);
      }
    }
  }

  isPointInside(x, y) {
    // Check if the point is inside the bounding rectangle of the hexagon
    if (
      x > this.x - this.radius &&
      x < this.x + this.radius &&
      y > this.y - this.radius &&
      y < this.y + this.radius
    ) {
      const localX = x - this.x;
      const localY = y - this.y;

      // Convert to axial coordinates
      const q = ((2 / 3) * localX) / this.radius;
      const r =
        ((-1 / 3) * localX) / this.radius +
        ((Math.sqrt(3) / 3) * localY) / this.radius;

      // Check if the point is inside the hexagon using axial coordinates
      if (Math.abs(q) <= 1 && Math.abs(r) <= 1 && Math.abs(q + r) <= 1) {
        return true;
      }
    }

    return false;
  }
}

class QuarterCircle extends Shape {
  constructor(
    x,
    y,
    radius,
    color,
    rotation = 0,
    isLevelShape = false,
    isBuildingBlock = false
  ) {
    super(x, y, color, rotation, isLevelShape, isBuildingBlock);
    this.radius = radius;
    this.type = "Quarter Circle";
  }

  draw() {
    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.rotate((Math.PI / 180) * this.rotation);

    ctx.beginPath();
    ctx.arc(0, 0, this.radius, 0, Math.PI / 2, false);
    ctx.lineTo(0, 0);
    ctx.closePath();

    ctx.fillStyle = this.isSnapped ? this.doneColor : this.color;
    ctx.fill();

    ctx.restore();
  }

  createShapeFromBlock() {
    if (!this.isBuildingBlock) return;
    return PinkQuarterCircle(this.x, this.y);
  }

  snapToTargetShape(targetShape) {
    if (targetShape.isLevelShapeFilled) return;

    if (targetShape instanceof QuarterCircle) {
      if (this.rotation % 360 != targetShape.rotation % 360) return; // Have to be the same rotation

      const distance = Math.sqrt(
        Math.pow(this.x - targetShape.x, 2) +
          Math.pow(this.y - targetShape.y, 2)
      );

      if (this.canMoveShapeBackToOrigin(targetShape)) {
        return;
      }

      if (distance <= this.snapDistanceThreshold) {
        this.x = targetShape.x;
        this.y = targetShape.y;
        this.snapUpdate(targetShape);
      }
    }
  }

  isPointInside(x, y) {
    const centerX = this.x;
    const centerY = this.y;
    const adjustedX =
      (x - centerX) * Math.cos((Math.PI / 180) * -this.rotation) -
      (y - centerY) * Math.sin((Math.PI / 180) * -this.rotation);
    const adjustedY =
      (x - centerX) * Math.sin((Math.PI / 180) * -this.rotation) +
      (y - centerY) * Math.cos((Math.PI / 180) * -this.rotation);

    // Calculate the distance between the adjusted point and the center of the rotated quarter circle
    const distance = Math.sqrt(Math.pow(adjustedX, 2) + Math.pow(adjustedY, 2));

    // Check if the distance is within the radius of the quarter circle
    // and if the point is within the visible area of the quarter circle
    return (
      distance <= this.radius &&
      adjustedX >= 0 &&
      adjustedY >= 0 &&
      adjustedX <= this.radius &&
      adjustedY <= this.radius
    );
  }
}

//====================================
//          JS Doc types
//====================================
/**
 * @typedef {object} Shape
 * @property {number} x - The x-coordinate of the shape.
 * @property {number} y - The y-coordinate of the shape.
 * @property {number} rotation - The rotation angle of the shape.
 * @property {boolean} isLevelShape - Indicates if the shape is part of the level shape.
 * @property {boolean} isSnapped - Indicates if the shape is snapped into place.
 * @property {string} type - The type of the shape (e.g., "OrangeSquare", "RedCircle").
 */

//====================================
//          Shape Factory's
//====================================
/*We need these functions becuase we use the same shape
class for mulipes different shapes and it just makes it easier*/

function OrangeSquare(
  x,
  y,
  rotation = 0,
  isLevelTile = false,
  isBuildingBlock = false
) {
  const SQUARE_SIZE = 100;
  let color = isLevelTile ? "#D9D9D9" : "#7BBEFC";
  return new Square(
    x,
    y,
    SQUARE_SIZE,
    SQUARE_SIZE,
    color,
    rotation,
    isLevelTile,
    isBuildingBlock
  );
}

function RedCircle(
  x,
  y,
  rotation = 0,
  isLevelTile = false,
  isBuildingBlock = false
) {
  const CIRCLE_RADIUS = 50;
  let color = isLevelTile ? "#D9D9D9" : "#F08C8C";
  return new Circle(
    x,
    y,
    CIRCLE_RADIUS,
    color,
    rotation,
    isLevelTile,
    isBuildingBlock
  );
}

function BlueRightTriangle(
  x,
  y,
  rotation = 0,
  isLevelTile = false,
  isBuildingBlock = false
) {
  const BASE = 100;
  const HEIGHT = 100;
  let color = isLevelTile ? "#D9D9D9" : "#968FFF";
  return new RightTriangle(
    x,
    y,
    BASE,
    HEIGHT,
    color,
    rotation,
    isLevelTile,
    isBuildingBlock
  );
}

function GreenTrapezoid(
  x,
  y,
  rotation = 180,
  isLevelTile = false,
  isBuildingBlock = false
) {
  const BASE = 200;
  const HEIGHT = 100;
  let color = isLevelTile ? "#D9D9D9" : "#A36DBD";
  return new Trapezoid(
    x,
    y,
    BASE,
    HEIGHT,
    color,
    rotation,
    isLevelTile,
    isBuildingBlock
  );
}

function GreenEquilateralTriangle(
  x,
  y,
  rotation = 0,
  isLevelTile = false,
  isBuildingBlock = false
) {
  const SIDE_LENGTH = 95;
  let color = isLevelTile ? "#D9D9D9" : "#FFCC4D";
  return new EquilateralTriangle(
    x,
    y,
    SIDE_LENGTH,
    color,
    rotation,
    isLevelTile,
    isBuildingBlock
  );
}

function BlueHexagon(
  x,
  y,
  rotation = 0,
  isLevelTile = false,
  isBuildingBlock = false
) {
  const SIDE_LENGTH = 100;
  let color = isLevelTile ? "#D9D9D9" : "#81E5DB";

  return new Hexagon(
    x,
    y,
    SIDE_LENGTH,
    color,
    rotation,
    isLevelTile,
    isBuildingBlock
  );
}

function YellowDiamond(
  x,
  y,
  rotation = 0,
  isLevelTile = false,
  isBuildingBlock = false
) {
  const WIDTH = 70;
  const HEIGHT = 200;
  let color = isLevelTile ? "#D9D9D9" : "#E5CF81";

  return new Diamond(
    x,
    y,
    WIDTH,
    HEIGHT,
    color,
    rotation,
    isLevelTile,
    isBuildingBlock,
    "yellow"
  );
}

function PurpleDiamond(
  x,
  y,
  rotation = 0,
  isLevelTile = false,
  isBuildingBlock = false
) {
  // TODO: Change this.
  const WIDTH = 100;
  const HEIGHT = 200;
  let color = isLevelTile ? "#D9D9D9" : "#CA6B6E";

  return new Diamond(
    x,
    y,
    WIDTH,
    HEIGHT,
    color,
    rotation,
    isLevelTile,
    isBuildingBlock,
    "purple"
  );
}

function PinkQuarterCircle(
  x,
  y,
  rotation = 0,
  isLevelTile = false,
  isBuildingBlock = false
) {
  const RADIUS = 100;
  let color = isLevelTile ? "#D9D9D9" : "#727A9C";
  return new QuarterCircle(
    x,
    y,
    RADIUS,
    color,
    rotation,
    isLevelTile,
    isBuildingBlock
  );
}

// TODO
//Get Distances for each shape from where you drop, look for the closest shape,
// If the drag shape type and closest shape are teh same then do the snap
// Otherwise give feedback about wrong shape

//====================================
//          Canvas Settings
//====================================

/**
 * @type {HTMLElement}
 */
const canvas = document.getElementById("canvas");

/** @type {CanvasRenderingContext2D} */
const ctx = canvas.getContext("2d");

/**
 * @type {HTMLElement}
 */
const container = document.getElementById("container");

canvas.width = container.clientWidth + 300;
canvas.height = container.clientHeight + 300;

//TODO
// - Store User ID in local storage so it can be used in csv file name
// - Add parameters the the tiles-game route to specify what level it should be,
// then use those paramertrs to call changeCurrentLevel(2, 1); with the correct values
// also maybe store those values in local storage so we can progreess between levels when sent to scoring page

function getLocalStorageOrNull(key) {
  try {
    const value = localStorage.getItem(key);
    return value !== null ? value : null;
  } catch (error) {
    console.error("Error retrieving from local storage:", error);
    return null;
  }
}

//====================================
//          Global Variables
//====================================

//Shape Stuff
let shapes = [];
let current_shape_index = null;
let closest_shape_to_current = null;

//Level Data
let current_level = 1;
let current_sub_level = 1;

//Text to show when wrong shape
/**
 * @type {HTMLElement}
 */
const shapeFeedbackText = document.querySelector(".shapeFeedbackText");

//Progress Bar
const progressBar = document.getElementById("progressBar");
const progressBarPercent = document.getElementById("progress-bar-percent");

//Mouse Data
let mouse_motion_array = [];
let lastCollectionTime = 0;
const throttlingInterval = 150; // 150 milliseconds

//  -> Mouse Acceleration
//      -> Define variables to store previous mouse position and timestamp
let prevMouseX = 0;
let prevMouseY = 0;
let prevTimestamp = 0;

//====================================
//          Building Blocks
//====================================

// Create an array with instances of different shapes
const building_blocks = [
  OrangeSquare((canvas.width * 0.55) / 4 - 20, 10, 0, false, true),
  RedCircle((canvas.width * 0.25) / 10, 20, 0, false, true),
  GreenTrapezoid((canvas.width * 0.25) / 4 - 20, 130, 180, false, true),
  BlueRightTriangle((canvas.width * 0.25) / 4 - 20, 260, 0, false, true),
  GreenEquilateralTriangle((canvas.width * 0.25) / 2 + 40, 310, 0, false, true),
  BlueHexagon((canvas.width * 0.25) / 2 - 20, 440, 180, false, true),
  YellowDiamond((canvas.width * 0.25) / 2 - 50, 480, 90, false, true),
  PurpleDiamond((canvas.width * 0.25) / 2 - 60, 580, 90, false, true),
  PinkQuarterCircle((canvas.width * 0.25) / 2 - 60, 750, 0, false, true),
];

// shapes.push(...building_blocks);

function drawSectionLines() {
  const section_one_line = canvas.width * 0.25;
  const section_two_line = canvas.width * 0.75;

  ctx.beginPath();

  ctx.moveTo(section_one_line, 0);
  ctx.lineTo(section_one_line, canvas.height);
  ctx.stroke();

  ctx.moveTo(section_two_line, 0);
  ctx.lineTo(section_two_line, canvas.height);
  ctx.stroke();

  ctx.closePath();
}

//====================================
//              Levels
//====================================

let LEVEL_X = canvas.width / 2;
let LEVEL_Y = canvas.height / 2;
// Puzzl pices the ones in grey.
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

    2: [],
    3: [],
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
  },
  3: {
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
  },
};

function changeCurrentLevel(level, sub_level) {
  current_level = level;
  current_sub_level = sub_level;

  //Reset All Shapes on screen
  shapes = [];

  //Add Back and Draw needed blocks
  shapes.push(...building_blocks);
  shapes.push(...LEVELS[current_level][current_sub_level]);

  //Update UI
  drawShapes();
  updateProgressBar();
}

//====================================
//          Progress Bar
//====================================

// Update the progress bar with a percentage value
function updateProgressBar() {
  percentage = getProgressBarPercentage();
  progressBar.style.width = percentage + "%";
}

function getProgressBarPercentage() {
  const TOTAL_TILES_IN_LEVEL = LEVELS[current_level][current_sub_level].length; //Change as needed
  let level_tiles_filled = 0;

  for (let targetShape of shapes.filter((s) => s.isLevelShape)) {
    if (targetShape.isLevelShapeFilled) level_tiles_filled += 1;
  }

  // console.log(level_tiles_filled, " // ", TOTAL_TILES_IN_LEVEL);

  let percent_level_complete = Math.round(
    (level_tiles_filled / TOTAL_TILES_IN_LEVEL) * 100
  );

  //Set percentage text
  progressBarPercent.innerText = `${percent_level_complete}% complete`;

  return percent_level_complete;
}

//====================================
//             Utils
//====================================

function calculateMousePos(clientX, clientY) {
  /* Function to calculate mouse coordinates relative to the canvas*/
  const rect = canvas.getBoundingClientRect();
  const scaleX = canvas.width / rect.width;
  const scaleY = canvas.height / rect.height;
  const x = (clientX - rect.left) * scaleX;
  const y = (clientY - rect.top) * scaleY;
  return { x, y };
}

function calculateTotalLevelTime() {
  console.log("BEFORE CALC - ", mouse_motion_array);
  const firstTimestamp = mouse_motion_array[0][2];
  const lastTimestamp = mouse_motion_array[mouse_motion_array.length - 1][2];
  console.log("Calc Time - ", firstTimestamp, lastTimestamp);

  // Assuming the time string format is "HH:mm:ss:SSS"
  const timeComponentsFirst = firstTimestamp.split(":");
  const timeComponentsLast = lastTimestamp.split(":");

  // Create Date objects with the time components
  const firstDate = new Date();
  firstDate.setHours(parseInt(timeComponentsFirst[0]));
  firstDate.setMinutes(parseInt(timeComponentsFirst[1]));
  firstDate.setSeconds(parseInt(timeComponentsFirst[2]));
  firstDate.setMilliseconds(parseInt(timeComponentsFirst[3]));

  const lastDate = new Date();
  lastDate.setHours(parseInt(timeComponentsLast[0]));
  lastDate.setMinutes(parseInt(timeComponentsLast[1]));
  lastDate.setSeconds(parseInt(timeComponentsLast[2]));
  lastDate.setMilliseconds(parseInt(timeComponentsLast[3]));

  console.log("Date! - ", firstDate, lastDate);

  const sub = lastDate - firstDate;
  console.log("DONE - ", sub); // This should now work correctly

  // Calculate minutes and seconds from the time difference
  const minutes = Math.floor(sub / (1000 * 60));
  const seconds = Math.floor((sub / 1000) % 60);

  console.log("Minutes:", minutes);
  console.log("Seconds:", seconds);
}

function showFeedbackText() {
  shapeFeedbackText.style.display = "block";

  setTimeout(() => {
    shapeFeedbackText.style.display = "none";
  }, 1000);
}

function euclideanDistance(x1, y1, x2, y2) {
  const deltaX = x2 - x1;
  const deltaY = y2 - y1;
  const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
  return distance;
}

function calculateShortestEuclidianDistanceForCurrentLevel() {
  shortestEuclidDistances = {};
  // console.log(shapes);

  for (let levelShape of shapes.filter((s) => s.isLevelShape)) {
    //Getting Building Block
    let buildingBlockOfSameLevelShape = null;
    shapes.forEach((shape) => {
      if (shape.isBuildingBlock && shape.type == levelShape.type) {
        buildingBlockOfSameLevelShape = shape;
      }
    });

    distance = euclideanDistance(
      buildingBlockOfSameLevelShape.x,
      buildingBlockOfSameLevelShape.y,
      levelShape.x,
      levelShape.y
    );

    // console.log(
    //   "x1 - ",
    //   buildingBlockOfSameLevelShape.x,
    //   "  y1 - ",
    //   buildingBlockOfSameLevelShape.y,
    //   "    x2 - ",
    //   levelShape.x,
    //   "    y2 - ",
    //   levelShape.y
    // );

    // console.log(
    //   "Distance - ",
    //   distance,
    //   "    Shape - ",
    //   buildingBlockOfSameLevelShape.type
    // );

    if (levelShape.type in shortestEuclidDistances) {
      //Add to Shortest Distance
      shortestEuclidDistances[levelShape.type] += distance;
    } else {
      shortestEuclidDistances[levelShape.type] = distance;
    }
  }

  console.log("Shortest Euclid Distance For Level - ", shortestEuclidDistances);
}

//====================================
//        Collect mouse data
//====================================
function getTimestamp() {
  // Create a new Date object
  const currentDate = new Date();

  // Get the individual components of the current timestamp
  const hours = currentDate.getHours().toString().padStart(2, "0");
  const minutes = currentDate.getMinutes().toString().padStart(2, "0");
  const seconds = currentDate.getSeconds().toString().padStart(2, "0");
  const milliseconds = currentDate
    .getMilliseconds()
    .toString()
    .padStart(3, "0");

  // Format the timestamp
  const formattedTimestamp = `${hours}:${minutes}:${seconds}:${milliseconds}`;

  return formattedTimestamp;
}

function postMouseMotionData() {
  console.log("Right before - ", mouse_motion_array);
  fetch("/process-mouse-data", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      data: mouse_motion_array,
      level: current_level,
      userID: getLocalStorageOrNull("userID"),
    }),
  })
    .then((res) => {
      //RESET
      // mouse_motion_accumulator = 0;
      // mouse_motion_array = [];
    })
    .catch((err) => console.log(err));

  console.log("Right after - ", mouse_motion_array);
}

function postLevelMouseData() {
  /*
    This function will post the acculated data of the mouse movements
    for the current level to the server to create the csv file. It will then
    reset all of the accumulators
  */

  calculateTotalLevelTime();
  console.log("End of motion - ", mouse_motion_array);
  postMouseMotionData();
}

//====================================
//      Controls / EventListeners
//====================================
function mouse_down(event) {
  event.preventDefault();

  let clientX = 0;
  let clientY = 0;

  // Handle touch events as well
  if (event.type === "touchstart") {
    // Get touch coordinates
    const touch = event.touches[0];
    clientX = touch.clientX;
    clientY = touch.clientY;
  } else {
    clientX = event.clientX;
    clientY = event.clientY;
  }

  const { x, y } = calculateMousePos(clientX, clientY);

  // Check if the mouse is inside any shape
  for (let i = shapes.length - 1; i >= 0; i--) {
    const shape = shapes[i];

    //Prevent level tiles & snapped shapes from being moved
    if (shape.isPointInside(x, y) && !shape.isLevelShape && !shape.isSnapped) {
      console.log("Inside of a shape");

      if (shape.isBuildingBlock) {
        let newShape;

        if (shape instanceof Diamond) {
          //TODO - Determine if yellow or purple Diamond, pass that into createShapeFromBlock
        }
        // console.log("BUILD");

        newShape = shape.createShapeFromBlock();
        console.log(newShape.constructor.name);
        shapes.push(newShape);
        current_shape_index = shapes.length - 1;
        newShape.mouseDown(x, y);
      } else {
        current_shape_index = i;
        shape.mouseDown(x, y);
      }

      // Move the shape to the top of the stack
      // shapes.push(shapes.splice(i, 1)[0]);

      break;
    }
  }
}

function animateShapeToBuildingBlock(shape, buildingBlockOfShape) {
  const animationSpeed = 0.2; // You can adjust the speed as needed
  const dx = (buildingBlockOfShape.x - shape.x) * animationSpeed;
  const dy = (buildingBlockOfShape.y - shape.y) * animationSpeed;

  // Check if the shape is close enough to the buildingBlockOfShape
  if (Math.abs(dx) < 1 && Math.abs(dy) < 1) {
    // Snap the shape to the buildingBlockOfShape to avoid precision issues
    shape.x = buildingBlockOfShape.x;
    shape.y = buildingBlockOfShape.y;
    drawShapes();

    console.log(
      shape.x,
      shape.y,
      "    ",
      buildingBlockOfShape.x,
      buildingBlockOfShape.y
    );

    return;
  } else {
    // Move the shape towards the buildingBlockOfShape
    shape.x += dx;
    shape.y += dy;
  }

  // Update Position on screen
  drawShapes();

  // Repeat the animation on the next frame
  requestAnimationFrame(() => {
    animateShapeToBuildingBlock(shape, buildingBlockOfShape);
  });
}

function mouse_up(event) {
  console.log("UP");
  event.preventDefault();

  if (current_shape_index === null) return;

  const shape = shapes[current_shape_index];

  //Shape is not over correct shape, give feedback
  if (shape.type != closest_shape_to_current.type) {
    //Get Building Block so we can move shape back
    let buildingBlockOfShape = null;

    for (let buildingBlock of shapes.filter((s) => s.isBuildingBlock)) {
      if (shape.type == buildingBlock.type) {
        buildingBlockOfShape = buildingBlock;
      }
    }

    showFeedbackText();

    //Move shape back to Building Block
    animateShapeToBuildingBlock(shape, buildingBlockOfShape);
  }

  shape.mouseUp();
  current_shape_index = null;

  // Add the identifier for the end of stroke
  mouse_motion_array.push([
    "END_OF_STROKE",
    0,
    0,
    getTimestamp(),
    "END_OF_STROKE",
    0,
    0,
    0,
  ]);
}

function mouse_move(event) {
  if (current_shape_index === null) return;

  let clientX = 0;
  let clientY = 0;

  // Handle touch events as well
  if (event.type === "touchmove") {
    // Get touch coordinates
    const touch = event.touches[0];
    clientX = Math.round(touch.clientX);
    clientY = Math.round(touch.clientY);
  } else {
    clientX = event.clientX;
    clientY = event.clientY;
  }

  //Collect mouse data every interval set by global var
  const currentTime = Date.now();

  const { x, y } = calculateMousePos(clientX, clientY);

  // Calculate the change in position and time
  const dx = x - prevMouseX;
  const dy = y - prevMouseY;
  const dt = currentTime - prevTimestamp;

  // Calculate the acceleration
  const accelerationX = dx / dt;
  const accelerationY = dy / dt;

  const accelerationX_in_px_per_s_squared = accelerationX * 1000;
  const accelerationY_in_px_per_s_squared = accelerationY * 1000;

  // Store the current mouse position and timestamp for the next iteration
  prevMouseX = x;
  prevMouseY = y;
  prevTimestamp = currentTime;

  // console.log(
  //   "X acc - ",
  //   Math.round(accelerationX_in_px_per_s_squared),
  //   "   Y acc - ",
  //   Math.round(accelerationY_in_px_per_s_squared)
  // );

  // Check if enough time has passed since the last collection
  if (currentTime - lastCollectionTime >= throttlingInterval) {
    if (mouse_motion_array) {
      // console.log("Dragging Img - ", event.clientX, " , ", event.clientY);
      mouse_motion_array.push([
        clientX,
        clientY,
        getTimestamp(),
        shapes[current_shape_index].type,
        Math.round(accelerationX_in_px_per_s_squared),
        Math.round(accelerationY_in_px_per_s_squared),
        window.screen.width, // Add screen width to the data
        window.screen.height,
      ]);
      lastCollectionTime = currentTime;
    }
  }

  let closestDistanceToShape = null;

  const shape = shapes[current_shape_index];
  for (let targetShape of shapes.filter(
    (s) => s.isLevelShape || s.isBuildingBlock
  )) {
    //Calculate distance from dragging shape to level shape
    const distance = shape.getDistanceToShape(targetShape);
    if (closestDistanceToShape == null) {
      closestDistanceToShape = distance;
      closest_shape_to_current = targetShape; //Global Var
    } else if (distance < closestDistanceToShape) {
      closestDistanceToShape = distance;
      closest_shape_to_current = targetShape; //Global Var
    }

    // Check if the shape is close enough to a special shape and snap it if true
    shape.snapToTargetShape(targetShape);
    updateProgressBar();
  }

  console.log(
    "Closest - ",
    closest_shape_to_current.type,
    "  ",
    closestDistanceToShape
  );

  if (getProgressBarPercentage() == 100) {
    if (mouse_motion_array.length != 0) {
      postLevelMouseData(); //Create csv
    }
    setTimeout(() => {}, 1000); // Wait 1s

    window.location.href = `/scoring_page?userID=${getLocalStorageOrNull(
      "userID"
    )}&level=${getLocalStorageOrNull("currentLevel")}`; //Goto scoring page
  }

  shapes[current_shape_index].mouseMove(x, y);

  drawShapes();
}

canvas.addEventListener("mousedown", mouse_down);
canvas.addEventListener("mouseup", mouse_up);
canvas.addEventListener("mousemove", mouse_move);

canvas.addEventListener("touchstart", mouse_down);
canvas.addEventListener("touchend", mouse_up);
canvas.addEventListener("touchmove", mouse_move);

//====================================
//          Game Functions
//====================================
function drawShapes() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawSectionLines();

  for (let shape of shapes) {
    shape.draw();
  }

  calculateShortestEuclidianDistanceForCurrentLevel();
}

//Testing
function rotateCurrentShape(deg) {
  if (current_shape_index !== null) {
    const shape = shapes[current_shape_index];

    //Prevents rotation when shape is snapped into place
    if (!shape.isDragging) return;

    shape.rotate(deg); // Adjust the rotation angle as desired
    console.log("Shape rotation - ", shape.rotation);
    drawShapes();
  }
}

document.addEventListener("keydown", function (event) {
  if (event.key === "r" || event.key === "R") {
    rotateCurrentShape(5);
    console.log("Rotated shape");
  }

  if (event.key === "e" || event.key === "E") {
    rotateCurrentShape(-5);
    console.log("Rotated shape");
  }
});

drawShapes();
