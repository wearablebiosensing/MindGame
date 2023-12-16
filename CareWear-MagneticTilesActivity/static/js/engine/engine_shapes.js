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
    this.snapDistanceThreshold = 60; //Flag to indicate how close a shape must be to Level shape to snap to it

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

      // console.log(
      //   "SnapOrigin:  dx - ",
      //   dx,
      //   "   dy - ",
      //   dy,
      //   "   thresh - ",
      //   threshold
      // );

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

    console.log(
      "SnapUpdate - ",
      targetShape.type,
      targetShape.isLevelShape,
      this.isLevelShapeFilled
    );
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
    return OrangeSquare(this.x, this.y, this.rotation);
  }

  resize(newWidth, newHeight) {
    this.width *= newWidth;
    this.height *= newHeight;
    this.x *= newWidth;
    this.y *= newHeight;
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
    return RedCircle(this.x - this.radius, this.y - this.radius, this.rotation);
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
    return GreenTrapezoid(
      this.x - this.base / 2,
      this.y - this.height / 2,
      this.rotation
    );
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
    return BlueRightTriangle(this.x, this.y, this.rotation);
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

      if (distance <= this.snapDistanceThreshold + 50) {
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
      ? YellowDiamond(this.x, this.y, this.rotation)
      : PurpleDiamond(this.x, this.y, this.rotation);
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
    return GreenEquilateralTriangle(this.x, this.y, this.rotation);
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
    return BlueHexagon(this.x, this.y, this.rotation);
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
    return PinkQuarterCircle(this.x, this.y, this.rotation);
  }

  snapToTargetShape(targetShape) {
    if (targetShape.isLevelShapeFilled) return;

    if (targetShape instanceof QuarterCircle) {
      // if (this.rotation % 360 != targetShape.rotation % 360) return; // Have to be the same rotation

      const distance = Math.sqrt(
        Math.pow(this.x - targetShape.x, 2) +
          Math.pow(this.y - targetShape.y, 2)
      );

      console.log(
        "QUAERT PINK DISTANCE - ",
        distance,
        this.snapDistanceThreshold
      );

      console.log("PINK - ", distance <= this.snapDistanceThreshold);

      if (this.canMoveShapeBackToOrigin(targetShape)) {
        return;
      }

      if (!this.isDragging) {
        //THIS IS A FIX DO NOT REMOVE OR IT BREAKS THE QUARTER CIRCLE
        return;
      }

      if (distance - 60 <= this.snapDistanceThreshold) {
        console.log("SNAP PINK - ", shapes);
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
