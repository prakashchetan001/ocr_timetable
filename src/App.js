import DocumentIntelligence from "@azure-rest/ai-document-intelligence";
import logo from './logo.svg';
import './App.css';
import * as React from "react";


const OCR_ENDPOINT = "https://southeastasia.api.cognitive.microsoft.com/";
const DOCUMENT_INTELLIGENCE_API_KEY =  "28ccc09d1747431f9e1cda90120418f9";
const timetable_image=  "https://imagestorehack.blob.core.windows.net/timetables/timetable_simple.png"
function App() {
  const documentIntelligenceRef  = React.useRef(null);
  React.useEffect(() => {
    if(!documentIntelligenceRef.current) {
      documentIntelligenceRef.current = DocumentIntelligence(OCR_ENDPOINT, {
        key:DOCUMENT_INTELLIGENCE_API_KEY,
      });
    }
    const client = documentIntelligenceRef.current 

  }, []);
  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p>
          Edit <code>src/App.js</code> and save to reload.
        </p>
        <a
          className="App-link"
          href="https://reactjs.org"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn React
        </a>
      </header>
    </div>
  );
}

export default App;
