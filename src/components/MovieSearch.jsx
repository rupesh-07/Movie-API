import React, { useState, useEffect } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import "./MovieSearch.css";

const API_KEY = import.meta.env.VITE_API_KEY;
const API_URL = "https://api.themoviedb.org/3/search/movie";
const IMAGE_BASE_URL = "https://image.tmdb.org/t/p/w500"; // Base URL for movie posters

const MovieSearch = () => {
  const [input, setInput] = useState("");
  const [movies, setMovies] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Load previous search from localStorage on initial load
  useEffect(() => {
    const storedData = localStorage.getItem("movieSearchResults");
    if (storedData) {
      const parsedData = JSON.parse(storedData);
      setInput(parsedData.query); // Restore previous search query
      setMovies(parsedData.results);
      setCurrentPage(parsedData.currentPage || 1); // Restore current page, default to 1
      setTotalPages(parsedData.totalPages || 0); // Restore total pages, default to 0
    }
  }, []);

  // Fetch movies based on input and currentPage
  const fetchMovies = async (query, page) => {
    if (!query.trim()) return;

    setLoading(true);
    setError("");

    try {
      const response = await axios.get(API_URL, {
        params: {
          api_key: API_KEY,
          query: query,
          page: page,
          language: "en-US",
        },
      });

      const results = response.data.results;
      if (results.length === 0) {
        setError("No movies found.");
      } else {
        setMovies(results);
        setTotalPages(response.data.total_pages);

        // Update localStorage with the current query, results, and pagination
        localStorage.setItem(
          "movieSearchResults",
          JSON.stringify({
            query,
            results,
            currentPage: page,
            totalPages: response.data.total_pages,
          })
        );
      }
    } catch (err) {
      setError("Failed to fetch movies.");
    } finally {
      setLoading(false);
    }
  };

  // Handle input change (clear previous search results if the input changes)
  const handleInputChange = (e) => {
    setInput(e.target.value); // Update the input query
    setMovies([]); // Clear previous movie results
    setCurrentPage(1); // Reset to page 1 when input changes
    setTotalPages(0); // Reset total pages
    localStorage.removeItem("movieSearchResults"); // Clear localStorage if input changes
  };

  // Handle page change (pagination)
  const handlePageChange = (page) => {
    setCurrentPage(page);
    fetchMovies(input, page);

    // Save updated pagination data to localStorage
    const storedData = localStorage.getItem("movieSearchResults");
    if (storedData) {
      const parsedData = JSON.parse(storedData);
      localStorage.setItem(
        "movieSearchResults",
        JSON.stringify({
          ...parsedData, // Spread the previous data
          currentPage: page, // Update currentPage in localStorage
        })
      );
    }
  };

  const handleSearchClick = () => {
    if (input.trim()) {
      fetchMovies(input, currentPage); // Fetch movies for the current page
    } else {
      setError("Please enter a movie name."); // Show error if input is empty
    }
  };

  return (
    <div>
      <div className="search-container">
        <h1>Search for Movies</h1>
        <p>
          Enter a movie title to start your search and discover the latest
          movies in our collection.
        </p>
        <input
          type="text"
          value={input}
          onChange={handleInputChange}
          placeholder="Search for a movie..."
        />
        <button onClick={handleSearchClick}>Find</button>
      </div>

      {loading && <p className="loading">Loading...</p>}
      {error && <p className="error">{error}</p>}

      <div className="movies-list-container">
        {movies.map((movie) => (
          <div key={movie.id} className="movie-item">
            <Link to={`/details/${movie.id}`} className="link-btn">
              <div className="movie-poster">
                <img
                  src={
                    movie.poster_path
                      ? `${IMAGE_BASE_URL}${movie.poster_path}`
                      : `/img/no-movie.png`
                  }
                  alt={movie.title}
                />
              </div>
              <h3>{movie.title}</h3>
              <p>{movie.release_date}</p>
            </Link>
          </div>
        ))}
      </div>

      {totalPages > 1 && (
        <div className="pagination">
          <button
            disabled={currentPage === 1}
            onClick={() => handlePageChange(currentPage - 1)}
            aria-label="Previous page"
          >
            Prev
          </button>
          <span>
            Page {currentPage} of {totalPages}
          </span>
          <button
            disabled={currentPage === totalPages}
            onClick={() => handlePageChange(currentPage + 1)}
            aria-label="Next page"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default MovieSearch;
