import BaseComponent from "core/BaseComponent";
import EditableStringInput from "components/EditableStringInput";
import { processFile } from "utils/FileUtils";

export default class Table extends BaseComponent {
  constructor(...args) {
    super(...args);
    this.autoBind();
  }
  render() {
    let data = this.props.data || [ [] ];
    let rowVars = this.props.rowVariables || [];
    return (
      <div className="data-table-container" onDragOver={this.allowDrop} onDrop={this.handleDrop}>
        <table className="data-table"
          style={{
            width: data[0].length * 35 + 70
          }}
        >
          <thead>
            <tr>
              <th key="variable">
              </th>
              {data[0].map((d, i) => {
                return (<th
                  className={this.props.activeColumn === i ? "active" : undefined}
                  onClick={this.props.onColumnClick.bind(null, i)} 
                  key={i}>{i + 1}</th>);
              })}
            </tr>
          </thead>
          <tbody>
            {data.map((row, rowIndex) => {
              return (
                <tr key={rowIndex}>
                  <td key="variable">
                    <EditableStringInput
                      value={String(rowVars[rowIndex] === undefined ? rowIndex : rowVars[rowIndex])}
                      onDrag={this.onDrag.bind(null, rowIndex)}
                      onChange={this.props.onRowVariableChange.bind(null, rowIndex)}
                    />
                  </td>
                  {row.map((column, colIndex) => {
                    return (<td key={colIndex}>{column}</td>);
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    );
  }

  onDrag(rowIndex, event) {
    event.dataTransfer.setData("text/plain", JSON.stringify({
      type: "rowVariable",
      // We only pass the index. To avoid duplicates, the Step
      // component will always fetch 
      value: rowIndex
    }));
  }

  allowDrop(event) {
    event.dataTransfer.dropEffect = "copy";
    event.preventDefault();
  }

  handleDrop(event) {
    event.preventDefault();
    // If dropped items aren't files, reject them
    let dt = event.dataTransfer;
    let file, accessor = "items";
    if (dt.items && dt.items[0].kind === "file") {
      file = dt.items[0].getAsFile();
    } else if (dt.files) {
      file = dt.files[0];
    }
    if (file) {
      let reader = new FileReader();
      reader.onload = () => {
        this.props.updateTableData(processFile(reader.result, file.name));
      };
      reader.readAsText(file);
    }
  }
};
