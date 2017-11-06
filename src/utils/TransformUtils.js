import { Matrix } from "transformation-matrix-js";

/**
 * Apply a translate transform to the given transformation matrix
 * @param  {Matrix} matrix    The 2D transformation matrix
 * @param  {Object} transform The transformation to apply
 * @return {Matirx}           The matrix with transformation applied
 */
function translate(matrix, transform) {
  return matrix.translate(transform.x, transform.y);
}

/**
 * Apply a scale transform to the given transformation matrix
 * @param  {Matrix} matrix    The 2D transformation matrix
 * @param  {Object} transform The transformation to apply
 * @return {Matirx}           The matrix with transformation applied
 */
function scale(matrix, transform) {
  return matrix.scale(transform.scaleX >= 0 ? transform.scaleX : 1,
    transform.scaleY >= 0 ? transform.scaleY : 1);
}

/**
 * Apply a rotate transform to the given transformation matrix
 * @param  {Matrix} matrix    The 2D transformation matrix
 * @param  {Object} transform The transformation to apply
 * @return {Matirx}           The matrix with transformation applied
 */
function rotate(matrix, transform) {
  // Rotate around a point, otherwise assume rotation point is 0, 0
  return matrix
        .translate(transform.rotateX || 0, transform.rotateY || 0)
        .rotateDeg(transform.rotation || 0)
        .translate((-transform.rotateX || 0), -(transform.rotateY || 0));
}

const transformsMap = {
  translate,
  rotate,
  scale
};


export function getTransformationMatrix(transforms) {
  let matrix = new Matrix();
  transforms.forEach((transform) => {
    matrix = transformsMap[transform.type](matrix, transform);
  });
  return matrix;
};
