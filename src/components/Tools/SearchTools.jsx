import { useState, useEffect } from 'react';
import axios from '../../api/axios';
import { SEARCH_TOOLS } from '../../api/apiUrls';

function SearchTools() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    
  });

  const fetchResults = async(event) => {
    console.log('Fetching results', event.target.value);
    
    
        //setLoading(false);
      const delayDebounce = setTimeout(async() => {
        const query = event.target.value;
        if (query.length > 2) { // Start searching only after 3 characters
          //setLoading(true);
          try {
            const response = await axios.get(SEARCH_TOOLS, {params: { query: query } });
            setResults(response.data.result);
          } catch (error) {
            console.error('Error fetching search results:', error);
          }
        } else {
          return;
        }
      }
      , 1000); // Debounce API calls
      return () => clearTimeout(delayDebounce);
    
  }

  return (
    <div>
      <input
        type="text"
        placeholder="Search tools..."
       
        onChange={fetchResults}
        className="search-box"
      />
      {loading && <p>Loading...</p>}
      <ul>
        {results.map((tool, index) => (
          <li key={index}>{tool.tool_name}</li>
        ))}
      </ul>
    </div>
  );
}

export default SearchTools;
