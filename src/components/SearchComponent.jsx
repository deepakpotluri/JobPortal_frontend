import React, { useState, useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import { FiMapPin, FiSearch } from 'react-icons/fi';

export const majorIndianCities = [
  'Mumbai', 'Delhi', 'Bangalore', 'Hyderabad', 'Chennai', 'Kolkata',
  'Pune', 'Ahmedabad', 'Jaipur', 'Surat', 'Lucknow', 'Kanpur',
  'Nagpur', 'Indore', 'Thane', 'Bhopal', 'Visakhapatnam',
  'Pimpri-Chinchwad', 'Patna', 'Vadodara', 'Ghaziabad',
  'Ludhiana', 'Agra', 'Nashik', 'Faridabad', 'Meerut',
  'Rajkot', 'Kalyan-Dombivli', 'Vasai-Virar', 'Varanasi'
];


const SearchComponent = ({ onKeywordSearch, isJobPage = false }) => {
  const [keywords, setKeywords] = useState([]);
  const [currentKeyword, setCurrentKeyword] = useState('');
  const [locations, setLocations] = useState([]);
  const [currentLocation, setCurrentLocation] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [filteredCities, setFilteredCities] = useState(majorIndianCities);
  const keywordInputRef = useRef(null);
  const locationInputRef = useRef(null);
  const suggestionsRef = useRef(null);

  useEffect(() => {
    if (currentLocation === '') {
      setFilteredCities(majorIndianCities);
    } else {
      const filtered = majorIndianCities.filter(city =>
        city.toLowerCase().includes(currentLocation.toLowerCase())
      );
      setFilteredCities(filtered);
    }
  }, [currentLocation]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        suggestionsRef.current &&
        !suggestionsRef.current.contains(event.target) &&
        !locationInputRef.current.contains(event.target)
      ) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleSearch = () => {
    let searchKeywords = [...keywords];
    let searchLocations = [...locations];

    if (currentKeyword.trim()) {
      searchKeywords = [...keywords, currentKeyword.trim()];
      setKeywords(searchKeywords);
      setCurrentKeyword('');
    }

    if (currentLocation.trim()) {
      searchLocations = [...locations, currentLocation.trim()];
      setLocations(searchLocations);
      setCurrentLocation('');
    }

    onKeywordSearch(searchKeywords, searchLocations); // Pass both keywords and locations
  };

  const handleKeywordKeyDown = (e) => {
    if (e.key === 'Enter' && currentKeyword.trim() !== '') {
      e.preventDefault();
      addKeyword(currentKeyword.trim());
    }
  };

  const handleLocationKeyDown = (e) => {
    if (e.key === 'Enter' && currentLocation.trim() !== '') {
      e.preventDefault();
      addLocation(currentLocation.trim());
    }
  };

  const addKeyword = (keyword) => {
    if (!keywords.includes(keyword)) {
      const newKeywords = [...keywords, keyword];
      setKeywords(newKeywords);
      onKeywordSearch(newKeywords, locations);
    }
    setCurrentKeyword('');
  };

  const addLocation = (location) => {
    if (!locations.includes(location)) {
      const newLocations = [...locations, location];
      setLocations(newLocations);
      onKeywordSearch(keywords, newLocations); // Update filter with new location
    }
    setCurrentLocation('');
    setShowSuggestions(false);
  };

  const removeKeyword = (keywordToRemove) => {
    const newKeywords = keywords.filter(keyword => keyword !== keywordToRemove);
    setKeywords(newKeywords);
    onKeywordSearch(newKeywords, locations); // Update filter when keyword is removed
  };

  const removeLocation = (locationToRemove) => {
    const newLocations = locations.filter(location => location !== locationToRemove);
    setLocations(newLocations);
    onKeywordSearch(keywords, newLocations); // Update filter when location is removed
  };

  return (
    <div className="flex flex-col items-center justify-items-center w-full max-w-4xl mx-auto">
      {!isJobPage && (
        <>
          <h1 className="text-4xl font-bold mb-4 m-24 text-slate-800">
            Get hired by the popular teams.
          </h1>
          <p className="text-xl mb-8 text-slate-800">
            Explore Thousands of jobs with just a simple search...
          </p>
        </>
      )}

      <div className="flex w-full">
        <div className="flex-grow relative">
          <div className="flex flex-wrap gap-2 p-2 bg-white rounded-l-lg">
            <div>
              <FiSearch className="text-gray-500 text-xl" />
            </div>
            {keywords.map((keyword, index) => (
              <span
                key={`keyword-${keyword}-${index}`}
                className="bg-blue-100 text-blue-800 px-2 py-2 rounded flex items-center text-sm"
              >
                {keyword}
                <X 
                  className="ml-1 cursor-pointer" 
                  size={14} 
                  onClick={() => removeKeyword(keyword)}
                />
              </span>
            ))}
            <input
              ref={keywordInputRef}
              type="text"
              placeholder={keywords.length === 0 ? 'Job Titles, Keywords, Phrase' : ''}
              className="flex-grow outline-none"
              value={currentKeyword}
              onChange={(e) => setCurrentKeyword(e.target.value)}
              onKeyDown={handleKeywordKeyDown}
            />
          </div>
        </div>
        
        <div className="relative">
          <div className="flex flex-wrap gap-2 p-2 bg-white border-l">
            <div>
              <FiMapPin className="text-gray-500 text-xl" />
            </div>
            {locations.map((location, index) => (
              <span
                key={`location-${location}-${index}`}
                className="bg-green-100 text-green-800 px-2 py-2 rounded flex items-center text-sm"
              >
                {location}
                <X 
                  className="ml-1 cursor-pointer" 
                  size={14} 
                  onClick={() => removeLocation(location)}
                />
              </span>
            ))}
            <input
              ref={locationInputRef}
              type="text"
              placeholder={locations.length === 0 ? 'All Location' : ''}
              className="w-48 outline-none"
              value={currentLocation}
              onChange={(e) => {
                setCurrentLocation(e.target.value);
                setShowSuggestions(true);
              }}
              onKeyDown={handleLocationKeyDown}
              onFocus={() => setShowSuggestions(true)}
            />
          </div>
          
          {showSuggestions && (
            <ul 
              ref={suggestionsRef} 
              className="absolute z-10 w-full mt-1 bg-white border rounded shadow-lg max-h-60 overflow-y-auto"
            >
              {filteredCities.map((city, index) => (
                <li
                  key={`city-${city}-${index}`}
                  className="p-2 cursor-pointer hover:bg-gray-100"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => {
                    addLocation(city);
                    setShowSuggestions(false);
                  }}
                >
                  {city}
                </li>
              ))}
            </ul>
          )}
        </div>

        <button
          className="px-4 py-2 text-white bg-indigo-600 rounded-r-xl hover:bg-indigo-700"
          onClick={handleSearch}
        >
          Search
        </button>
      </div>
    </div>
  );
};

export default SearchComponent;
