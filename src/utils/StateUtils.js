export function setSelectionState(props, value) {
  props.selected = !!value;
  return props;
};

export function isSelected(props) {
  return props.selected === true;
};
