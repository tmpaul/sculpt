export default function SnapCross(props) {
  return (
    <g>
      <line className="snap-cross-line" x1={props.x - props.width / 2} x2={props.x - props.width / 7} y1={props.y} y2={props.y}/>
      <line className="snap-cross-line" x1={props.x + props.width / 7} x2={props.x + props.width / 2} y1={props.y} y2={props.y}/>
      <line className="snap-cross-line" x1={props.x} x2={props.x} y1={props.y - props.height / 2} y2={props.y - props.height / 7}/>
      <line className="snap-cross-line" x1={props.x} x2={props.x} y1={props.y + props.height / 7} y2={props.y + props.height / 2}/>
    </g>
  );
}
