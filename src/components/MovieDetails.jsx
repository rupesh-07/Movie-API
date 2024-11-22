import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import "./MovieDetails.css";

const API_KEY = import.meta.env.VITE_API_KEY;
const API_URL = "https://api.themoviedb.org/3/movie";
const IMAGE_BASE_URL = "https://image.tmdb.org/t/p/w500";

export default function MovieDetails() {
  const { id } = useParams(); // Get the movie ID from the URL

  const [movie, setMovie] = useState(null);
  const [trailer, setTrailer] = useState(null); // State to store trailer URL
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const navigate = useNavigate();

  // Fetch movie details
  useEffect(() => {
    const fetchMovieDetails = async () => {
      try {
        const movieResponse = await axios.get(`${API_URL}/${id}`, {
          params: {
            api_key: API_KEY,
            language: "en-US",
          },
        });
        setMovie(movieResponse.data);

        // Fetch the trailers for the movie
        const videoResponse = await axios.get(`${API_URL}/${id}/videos`, {
          params: {
            api_key: API_KEY,
            language: "en-US",
          },
        });

        // Find the YouTube trailer, if available
        const youtubeTrailer = videoResponse.data.results.find(
          (video) => video.site === "YouTube" && video.type === "Trailer"
        );

        if (youtubeTrailer) {
          setTrailer(`https://www.youtube.com/watch?v=${youtubeTrailer.key}`);
        }
      } catch (err) {
        setError("Failed to fetch movie details.");
      } finally {
        setLoading(false);
      }
    };

    fetchMovieDetails();
  }, [id]);

  if (loading)
    return (
      <p style={{ textAlign: "center", fontSize: "18px", margin: "1rem" }}>
        Loading movie details...
      </p>
    );

  if (error)
    return (
      <p style={{ textAlign: "center", fontSize: "18px", margin: "1rem" }}>
        {error}
      </p>
    );

  return (
    <>
      <button className="go-to-back" onClick={() => navigate(-1)}>
        Go Back
      </button>

      {movie && (
        <div className="movie-details-container">
          <h1>Movie Information</h1>
          <div className="movie-details">
            <div className="image-container">
              <img
                src={
                  movie.poster_path
                    ? `${IMAGE_BASE_URL}${movie.poster_path}`
                    : "https://via.placeholder.com/500x750?text=No+Image+Available"
                }
                alt={movie.title}
              />
            </div>
            <div className="movie-info">
              <p>
                <strong>Movie Name : </strong>
                {movie.title}
              </p>
              <p>
                <strong>Genres : </strong>
                {movie.genres && movie.genres.length > 0
                  ? movie.genres.map((genre, index) => (
                      <span key={index}>
                        {genre.name}
                        {index < movie.genres.length - 1 && ", "}
                      </span>
                    ))
                  : "N/A"}
              </p>

              <p>
                <strong>Release Date : </strong>
                {movie.release_date ? movie.release_date : "N/A"}
              </p>

              <p>
                <strong>Overview : </strong>
                {movie.overview ? movie.overview : "N/A"}
              </p>
              <p>
                <strong>Rating : </strong>
                {movie.vote_average ? movie.vote_average : "N/A"}
              </p>

              {/* Show the "Watch Trailer" button if trailer exists */}
              {trailer && (
                <a href={trailer} target="_blank" rel="noopener noreferrer">
                  <button className="trailer-btn">Watch Trailer</button>
                </a>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
