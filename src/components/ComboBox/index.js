import { useEffect, useRef, useState, useContext } from "react";
import ClientContext from "../../context/clientContext";
import "./styles.css";

function ComboBox({ id, options, item, setItem }) {
  const { client } = useContext(ClientContext)
  const [inputValue, setInputValue] = useState("");
  const [suggestions, setSuggestions] = useState(null);
  const ref = useRef();
  
  useEffect(() => {
    if(!client) {
      setInputValue('')
      setItem(null)
    }
    if(!item) {
      ref.current.selectedIndex = 0
    }
  }, [client, options]);

  const handleChange = (e) => {
    const { value } = e.target;
    if(value !== '') {
      const filter = options?.filter((elem) =>
        elem.description.toLowerCase().includes(value.toLowerCase())
      );
      if (filter.length !== 1) {
        ref.current.selectedIndex = 0;
      }
      setSuggestions(filter);
    } else {
      setSuggestions(options)
    }
    setInputValue(value);
    setItem(null)
  };

  const selectedOption = async (e) => {
    const { value } = e.target;
    const object = JSON.parse(value);
    setItem(object);
    setInputValue(object.description);
    setSuggestions(options)
  };


  return (
    <div className="d-flex align-items-center position-relative w-100">
      <input
        type="search"
        value={item ? item.description : inputValue}
        className="form-control form-control-sm input-select"
        onChange={handleChange}
        disabled={item ? true : false}
      />
      <select
        id={id}
        ref={ref}
        className="form-select form-select-sm"
        value={item && item.description}
        onChange={(e) => {
          selectedOption(e);
        }}
        required
        disabled={item ? true : false}
      >
        <option selected disabled value="">
          {suggestions?.length > 0
            ? "-- Seleccione --"
            : "No se encontraron coincidencias..."}
        </option>
        {(suggestions ? suggestions : options).sort((a, b) => a.branch - b.branch)
          .map((elem, index) => (
            <option key={index} id={elem.id} value={JSON.stringify(elem)}>{`${
              elem.branch ? elem.branch : elem.id
            }-${elem.description}`}</option>
          ))}
      </select>
    </div>
  );
}

export default ComboBox;
