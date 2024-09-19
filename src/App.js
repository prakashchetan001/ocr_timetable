import {default as DocumentIntelligence , isUnexpected, getLongRunningPoller} from "@azure-rest/ai-document-intelligence";

// import * as test from "@azure/ai-form-recognizer";
import logo from './logo.svg';
import './App.css';
import * as React from "react";


// https://southeastasia.api.cognitive.microsoft.com/formrecognizer/documentModels/prebuilt-layout:analyze?api-version=2023-07-31&stringIndexType=utf16CodeUnit

const OCR_ENDPOINT = "https://schedulerecongnizerus.cognitiveservices.azure.com/";
const DOCUMENT_INTELLIGENCE_API_KEY =  "0dfb0318b63e4a469dba43f02c3da429";// Replace this with the one sent on the chat
const timetable_image=  "https://imagestorehack.blob.core.windows.net/timetables/timetable_simple.png"
function App() {
  const documentIntelligenceRef  = React.useRef(null);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState(undefined);
  const [result, setResult] = React.useState(undefined);

  // Image Analyzer
  const analyzeImage = React.useCallback(async(client)=>{
    setLoading(true);
    const initialResponse = await client
      .path("/documentModels/{modelId}:analyze", "prebuilt-layout")
      .post({
        contentType: "application/json",
        body: {
          urlSource:  timetable_image
        },
        queryParams: {
          apiVersion: "2023-07-31",
          stringIndexType: "utf16CodeUnit"
        }
       
      });
      console.log("**Initial Response",initialResponse);
      if (isUnexpected(initialResponse)) {
        console.error("The response was unexpected: ", initialResponse);
        setError(initialResponse.body.error);
      }
      const poller = await getLongRunningPoller(client, initialResponse);
      const result = (await poller.pollUntilDone()).body ;
      const transformedRes = transformResult(result);
      
      console.log("***Logging ", transformResult(result));
      console.log(result);
      setResult(transformedRes);
      setLoading(false);
  },[setError, setLoading]);


  React.useEffect(() => {
    if(!documentIntelligenceRef.current) {
      documentIntelligenceRef.current = DocumentIntelligence(OCR_ENDPOINT, {
        key:DOCUMENT_INTELLIGENCE_API_KEY,
      });
    }
    const client = documentIntelligenceRef.current;
    analyzeImage(client);
  }, [analyzeImage]);

  return (
    <div className="App">
      <h1>Document Intelligence</h1>
        <div>
          {loading && <p>Loading...</p>}
          {error && <p>Error: {error.message}</p>}
          {result && JSON.stringify(result.analyzeResult.tables)}  
        </div>
    </div>
  );
}

function transformResult(result) {
  const tables = result.analyzeResult.tables;
  const scheduleTable = tables[0];

  // Hardcoding to 0 now and not mapping with the time constant
  let timePeriods = scheduleTable.cells.filter((cell) => cell.columnIndex === 0 && cell.rowIndex !== 0);
  const timePeriodsConverted = timePeriods.reduce((acc, cell) => {
    acc.push(cell.content);
    return acc;
  } , []);  
  const filteredSubjectCells = scheduleTable.cells.filter((cell) => cell.columnIndex !== 0 && cell.rowIndex !== 0);
  // Transform the filtered cells into a map of day and events
  const dayAndEventMap = filteredSubjectCells.reduce((acc, cell) => {
    const {rowIndex, columnIndex} = cell;
    acc[columnIndex] = acc[columnIndex] || [];
    const subjectName  =  cell.content;
    const timePeriod = timePeriodsConverted[rowIndex - 1]; 
    acc[columnIndex].push({
      timePeriod,
      subjectName
    });
    return acc;
  }, {});
  
  console.log("Day and Event Map", dayAndEventMap);
  return dayAndEventMap;
}
export default App;
