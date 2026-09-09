import { useEffect, useState } from 'react';
import './App.css';
import { GoPlus } from "react-icons/go";
import { BiBell } from "react-icons/bi";
import { CiSearch, CiUser, CiBellOn } from "react-icons/ci";
import { FaLocationDot, FaPlus, FaUser } from "react-icons/fa6";
import { LuWind } from "react-icons/lu";
import { WiStrongWind, WiNightCloudy, WiNightAltCloudyHigh, WiCloudy, WiNightRainWind, WiRainWind, WiSmoke, WiSleet, WiNightSleet, WiFog, WiThunderstorm, WiStormShowers } from "react-icons/wi";
import { FiDroplet } from "react-icons/fi";
import { BsCloudSun, BsCloudDrizzle, BsCloudsFill, BsCloudHaze2, BsCloudSleet, BsClouds } from "react-icons/bs";
import { IoSunnyOutline, IoCloudyOutline, IoSnowOutline, IoCloud } from "react-icons/io5";
import { TbCloudStorm, TbMist } from "react-icons/tb";


import image from './myphoto.png'
import broken_cloud from './broken cloud.mp4'
import clear_sky from './clear sky.mp4'
import few_clouds from './few clouds.mp4'
import scattered_cloud from './scattered cloud.mp4'
import overcast_cloud from './overcast cloud.mp4'
import mist_cloud from './mist clouds.mp4'
import fog_cloud from './fog clouds.mp4'
import shower_rain from './shower rain.mp4'
import rain from './rain.mp4'
import thunderstorm from './thunderstorm.mp4'
import snow from './snow.mp4'
import drizzle from './drizzle.mp4'




function App() {
  const [apiData, setApiData] = useState({});
  const [cityName, setCityName] = useState("");
  const [forecastData, setForecastData] = useState([]);
  const [nearbyCities, setNearbyCities] = useState([]);
  const [nearbyWeather, setNearbyWeather] = useState([]);
  const countryName = new Intl.DisplayNames(['en'], { type: 'region' });
  const [error, setError] = useState("");
  const [closing, setClosing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showPlusMenu, setShowPlusMenu] = useState(false);
  const [showNotification, setShowNotification] = useState(false);
  const [loadingCity, setLoadingCity] = useState("");
  const [searchedCity, setSearchedCity] = useState("");
  const isMobile = window.innerWidth <= 768;
  const [firstName, setFirstName] = useState(
    localStorage.getItem("firstName") || ""
  );

  const [lastName, setLastName] = useState(
    localStorage.getItem("lastName") || ""
  );

  const [profileImage, setProfileImage] = useState(
    localStorage.getItem("profileImage") || ""
  );

  const [showProfileForm, setShowProfileForm] = useState(
    !localStorage.getItem("firstName") ||
    !localStorage.getItem("lastName")
  );

  const [tempFirstName, setTempFirstName] = useState("");
  const [tempLastName, setTempLastName] = useState("");
  const [tempImage, setTempImage] = useState("");

  useEffect(() => {
    fetchWeather("London");
  }, []);

  useEffect(() => {
    [
      clear_sky,
      few_clouds,
      scattered_cloud,
      broken_cloud,
      overcast_cloud,
      mist_cloud,
      fog_cloud,
      shower_rain,
      rain,
      thunderstorm,
      snow,
      drizzle,
    ].forEach((video) => {
      const v = document.createElement("video");
      v.src = video;
      v.preload = "auto";
    });
  }, []);


  const fetchWeather = async (city) => {
    try {
      // setCityName(city);
      const currentRes = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=416c3f13499bc9f54e29f8a85c214fd8&units=metric`
      );

      const currentData = await currentRes.json();

      if (currentData.cod !== 200) {
        setError("City not found");
        return;
      }
      setError("");
      setApiData(currentData);

      const forecastRes = await fetch(
        `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=416c3f13499bc9f54e29f8a85c214fd8&units=metric`
      );

      const forecast = await forecastRes.json();

      const dailyForecast = forecast.list.filter(item =>
        item.dt_txt.includes("12:00:00")
      );
      setForecastData(dailyForecast);


      const placesRes = await fetch(
        `https://api.geoapify.com/v2/places?categories=populated_place.city,populated_place.town&filter=circle:${currentData.coord.lon},${currentData.coord.lat},50000&limit=20&apiKey=599f534528714726b8c820357e550c0b`
      );

      const placesData = await placesRes.json();

      // console.log(placesData);
      // const cities = placesData.features
      //   .map(item => item.properties.city)
      //   .filter(city => city && city !== currentData.name)
      //   .slice(0, 3);


      const cities = placesData.features
        .map(item => item.properties.city)
        .filter(city => city && city !== currentData.name)
        .map(city =>
          city.normalize("NFD").replace(/[\u0300-\u036f]/g, "")
        )
        .slice(0, 3);


      console.log(cities);
      const weatherPromises = placesData.features
        .slice(0, 3)
        .map(async (place) => {

          const { lat, lon } = place.properties;
          const res = await fetch(
            `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=416c3f13499bc9f54e29f8a85c214fd8&units=metric`
          );
          return await res.json();
        });

      const weatherResults = (await Promise.all(weatherPromises))
        .filter(item => item !== null);

      setNearbyWeather(weatherResults);

      setNearbyCities(cities);
      // console.log(cities)

    } catch (err) {
      console.log(err);
      alert("Something went wrong!");
    }
  };

  const closeError = () => {
    setClosing(true);

    setTimeout(() => {
      setError("");
      setClosing(false);
    }, 400);
    setCityName("");
  };

  const main = apiData.weather?.[0]?.main;
  const desc = apiData.weather?.[0]?.description?.toLowerCase();

  let currentVideo = clear_sky;
  let videoClass = "bg-image";

  if (main === "Clear") {
    currentVideo = clear_sky;
    videoClass = "bg-image";
  }
  else if (main === "Clouds") {
    if (desc === "few clouds") {
      currentVideo = few_clouds;
      videoClass = "bg-image fewCloud";
    }
    else if (desc === "scattered clouds") {
      currentVideo = scattered_cloud;
      videoClass = "bg-image";
    }
    else if (desc === "broken clouds") {
      currentVideo = broken_cloud;
      videoClass = "bg-image brokenCloud";
    }
    else {
      currentVideo = overcast_cloud;
      videoClass = "bg-image";
    }

  }
  else if (main === "Rain") {
    if (desc.includes("shower")) {
      currentVideo = shower_rain;
      videoClass = "bg-image";
    } else {
      currentVideo = rain;
      videoClass = "bg-image rain";
    }
  }
  else if (main === "Drizzle") {
    currentVideo = drizzle;
    videoClass = "bg-image";
  }
  else if (main === "Thunderstorm") {
    currentVideo = thunderstorm;
    videoClass = "bg-image thunderstorm";
  }
  else if (main === "Snow") {
    currentVideo = snow;
    videoClass = "bg-image";
  }
  else if (main === "Mist") {
    currentVideo = mist_cloud;
    videoClass = "bg-image";
  }
  else if (main === "Fog") {
    currentVideo = fog_cloud;
    videoClass = "bg-image";
  }
  else if (main === "Haze") {
    currentVideo = mist_cloud;
    videoClass = "bg-image";
  }

  // const getWeather = async () => {

  //   if (!cityName.trim()) return;
  //   setLoading(true);
  //   setSearchedCity(cityName);
  //   // await new Promise(resolve => setTimeout(resolve, 2000));
  //   // fetchWeather(cityName);
  //   await fetchWeather(cityName);
  //   setCityName("");
  //   setLoading(false);
  // };


  const getWeather = async () => {

    if (!cityName.trim()) return;

    setLoadingCity(cityName);
    setLoading(true);
    setSearchedCity(cityName);

    await fetchWeather(cityName);

    setCityName("");
    setLoading(false);
  };


  console.log(apiData);

  const handleImageChange = (e) => {

    const file = e.target.files[0];

    if (!file) return;

    const reader = new FileReader();

    reader.onloadend = () => {
      setTempImage(reader.result);
    };

    reader.readAsDataURL(file);
  };


  const handleProfileSubmit = (e) => {

    e.preventDefault();

    if (!tempFirstName.trim() || !tempLastName.trim()) {
      return;
    }

    localStorage.setItem("firstName", tempFirstName);
    localStorage.setItem("lastName", tempLastName);

    setFirstName(tempFirstName);
    setLastName(tempLastName);

    if (tempImage) {
      localStorage.setItem("profileImage", tempImage);
      setProfileImage(tempImage);
    }

    setShowProfileForm(false);
  };

  const handleEditProfile = () => {
    setTempFirstName(firstName);
    setTempLastName(lastName);
    setTempImage(profileImage);

    setShowProfileMenu(false);
    setShowProfileForm(true);
  };

  const handleLogout = () => {
    localStorage.removeItem("firstName");
    localStorage.removeItem("lastName");
    localStorage.removeItem("profileImage");

    setFirstName("");
    setLastName("");
    setProfileImage("");

    setTempFirstName("");
    setTempLastName("");
    setTempImage("");


    setShowProfileMenu(false);
    setShowProfileForm(true);
  };

  const getWeatherIcon = (weather) => {
    switch (weather) {
      case "clear sky":
        return <IoSunnyOutline className="day-icon dc2" />;

      case "few clouds":
        return <WiNightCloudy className="day-icon" />;

      case "moderate rain":
      case "light rain":
      case "heavy intensity rain":
      case "very heavy rain":
      case "extreme rain":
        return <WiNightRainWind className="day-icon dc3" />;

      case "drizzle":
      case "light intensity drizzle":
      case "heavy intensity drizzle":
      case "light intensity drizzle rain":
      case "drizzle rain":
      case "heavy intensity drizzle rain":
      case "shower rain and drizzle":
      case "heavy shower rain and drizzle":
      case "shower drizzle":
        return <BsCloudDrizzle className="day-icon dc1" />;

      case "thunderstorm":
      case "light thunderstorm":
      case "heavy thunderstorm":
      case "ragged thunderstorm":
        return <TbCloudStorm className="day-icon dc2" />;

      case "thunderstorm with light rain":
      case "thunderstorm with rain":
      case "thunderstorm with heavy rain":
        return <WiStormShowers className="day-icon dc2" />;

      case "thunderstorm with light drizzle":
      case "thunderstorm with drizzle":
      case "thunderstorm with heavy drizzle":
        return <WiThunderstorm className="day-icon dc2" />;

      case "smoke":
        return <WiSmoke className="day-icon dc4" />;

      case "haze":
        return <BsCloudHaze2 className="day-icon dc1" />;

      case "fog":
        return <WiFog className="day-icon dc2" />;

      case "sand/dust whirls":
      case "mist":
      case "sand":
      case "dust":
      case "volcanic ash":
      case "squalls":
      case "tornado":
        return <TbMist className="day-icon dc2" />;

      case "sleet":
        return <WiSleet className="day-icon dc3" />;

      case "rain and snow":
      case "light rain and snow":
        return <BsCloudSleet className='day-icon dc5' />;

      case "shower sleet":
      case "light shower sleet":
        return <WiNightSleet className="day-icon dc2" />;

      case "snow":
      case "light snow":
      case "heavy snow":
      case "light shower snow":
      case "shower snow":
      case "heavy shower snow":
      case "freezing rain":
        return <IoSnowOutline className="day-icon dc2" />;

      case "scattered clouds":
        return <IoCloud className="day-icon dc7" />;

      case "shower rain":
      case "light intensity shower rain":
      case "heavy intensity shower rain":
      case "ragged shower rain":
        return <WiRainWind className="day-icon" />;

      case "broken clouds":
        return <BsClouds className="day-icon dc6" />;

      case "overcast clouds":
        return <BsCloudsFill className="day-icon dc1" />;

      default:
        return <WiNightAltCloudyHigh className="day-icon" />;
    }
  };


  return (
    <>
      {showProfileForm && (
        <div className="profile-form-overlay">

          <form
            className="profile-form"
            onSubmit={handleProfileSubmit}
          >

            <div className="profile-form-icon">

              {tempImage ? (
                <img src={tempImage} alt="Profile" />
              ) : (
                <FaUser />
              )}

            </div>

            <h1>Welcome</h1>

            <p>Let's set up your profile</p>

            <div className="name-input-div">

              <input
                type="text"
                placeholder="First Name"
                value={tempFirstName}
                maxLength={20}
                onChange={(e) => setTempFirstName(e.target.value)}
                required
              />

              <input
                type="text"
                placeholder="Last Name"
                value={tempLastName}
                maxLength={2}
                onChange={(e) => setTempLastName(e.target.value)}
                required
              />

            </div>

            <label className="choose-image">

              <span>
                {tempImage
                  ? "Change Profile Picture"
                  : "Choose Profile Picture"}
              </span>

              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
              />

            </label>

            <button type="submit">
              Continue
            </button>

          </form>

        </div>
      )}

      {
        loading && (
          <div className="loading-screen">
            <div className="spinner-border text-light" role="status"></div>
            <h2>Loading {loadingCity} Weather...</h2>
          </div>
        )
      }
      <div className='overall-div'>
        <div className='weather-container'>

          <video
            key={currentVideo}
            src={currentVideo}
            autoPlay
            loop
            muted
            playsInline
            className={videoClass}
          />
          <nav>
            <div className='cityName-div'>
              <h1 className='visit'>Welcome</h1>
              <h1 className='city-txt'>{firstName} {lastName}</h1>
            </div>
            <input type="text" placeholder='Enter The City' className='search-inp' value={cityName} onChange={(e) => setCityName(e.target.value)} spellCheck={false}
              autoCorrect="off"
              autoCapitalize="off"
              autoComplete="off" />
            {error && (
              <div className={`error-box ${closing ? "error-box-hide" : ""}`}>
                {error} <div className='wrongIcon-div' onClick={closeError}><FaPlus className='wrongIcon' /></div>
              </div>
            )}
            <div className='icons-div'>
              <div className="plus-wrapper">

                <div
                  className="plus"
                  onClick={() => {
                    setShowPlusMenu(!showPlusMenu);
                    setShowNotification(false);
                    setShowProfileMenu(false);
                  }}
                >
                  <GoPlus />
                </div>

                {showPlusMenu && (
                  <div className="plus-menu">

                    <div className="plus-menu-item">
                      <span>⭐</span>
                      <span>Add Favorite City</span>
                    </div>

                    <div className="plus-menu-item">
                      <span>📍</span>
                      <span>My Location</span>
                    </div>

                    <div className="plus-menu-item">
                      <span>🔄</span>
                      <span>Refresh Weather</span>
                    </div>

                  </div>
                )}

              </div>
              <div className='search' onClick={getWeather}>
                <CiSearch />
              </div>
              <div className="bell-wrapper">

                <div
                  className="bell"
                  onClick={() => {
                    setShowNotification(!showNotification);
                    setShowPlusMenu(false);
                    setShowProfileMenu(false);
                  }}
                >
                  <CiBellOn />
                </div>

                {showNotification && (
                  <div className="notification-menu">

                    <div className="notification-title">
                      <CiBellOn />
                      <span>Weather Alerts</span>
                    </div>

                    <div className="notification-item">
                      <span>🌧️</span>
                      <div>
                        <strong>Rain Alert</strong>
                        <p>Rain may occur today</p>
                      </div>
                    </div>

                    <div className="notification-item">
                      <span>🌡️</span>
                      <div>
                        <strong>Temperature Alert</strong>
                        <p>High temperature expected</p>
                      </div>
                    </div>

                    <div className="notification-item">
                      <span>💨</span>
                      <div>
                        <strong>Wind Alert</strong>
                        <p>Strong winds may occur</p>
                      </div>
                    </div>

                  </div>
                )}

              </div>
              <div className="profile-wrapper">

                <div
                  className="profile"
                  onClick={() => {
                    setShowProfileMenu(!showProfileMenu);
                    setShowPlusMenu(false);
                    setShowNotification(false);
                  }}
                >
                  {profileImage ? (
                    <img src={profileImage} alt="Profile" />
                  ) : (
                    <CiUser className="default-user-icon" />
                  )}
                </div>

                {showProfileMenu && (
                  <div className="profile-menu">

                    <div
                      className="profile-menu-item"
                      onClick={handleEditProfile}
                    >
                      <FaUser />
                      <span>Edit Profile</span>
                    </div>

                    <div
                      className="profile-menu-item logout"
                      onClick={handleLogout}
                    >
                      <span>Log Out</span>
                    </div>

                  </div>
                )}

              </div>
            </div>
          </nav>
          <div className='degreesDiv'>
            <div className='degree degree1'>
              <h1 className='loc'><FaLocationDot className='loc-icon' />{apiData.name || searchedCity}</h1>
              <h1>{apiData.main ? Math.floor(apiData.main.temp) : "0"}<sup>o</sup>C</h1>
              <div className='alldegrees-div'>
                <h1><LuWind className='wind-icon' />   {apiData.wind ? Math.floor(apiData.wind.speed * 2.23694) : "0"} mph</h1>
                <h1><FiDroplet className='wind-icon' />
                  {apiData.main ? Math.floor(apiData.main.humidity) : "0"}%</h1>
                <h1><WiStrongWind className='wind-icon1' />  {apiData.wind ? Math.floor(apiData.wind.speed * 3.6) : "0"}Km/h</h1>
              </div>
            </div>
            {nearbyWeather.map((city, index) => (
              <div className={`degree degree${index + 2}`} key={index} onClick={async () => {
                const selectedCity = nearbyCities[index];

                setLoadingCity(selectedCity);
                setLoading(true);

                await fetchWeather(selectedCity);

                setCityName("");
                setLoading(false);
              }}>
                <div className='left-div'>
                  <h1 className='txt1'> {city.sys?.country ? countryName.of(city.sys.country) : "Unknown"}</h1>
                  <h1 className='txt2'>{nearbyCities[index]}</h1>
                  <h1 className='txt1'>{city.weather?.[0]?.main}</h1>
                </div>

                <div className='right-div'>
                  <h1>
                    {Math.round(city.main?.temp)}<sup>o</sup>{" "}
                    <span className='rightDiv-icon'>{getWeatherIcon(city.weather?.[0]?.description)}</span>
                  </h1>
                </div>
              </div>
            ))}
          </div>
          <div className='content-div'>
            <div className='forecast'>
              <h1>Weather Forecast</h1>
            </div>
            <h1 className='weather-type'>{apiData.weather?.[0]?.main} <br />With {apiData.weather?.[0]?.description}</h1>
            <p className="content-txt">
              Today's weather in <b>{apiData.name}</b> is{" "}
              <b>{apiData.weather?.[0]?.description}</b>. The current temperature is{" "}
              <b>{Math.round(apiData.main?.temp)}°C</b>, with a feels-like temperature of{" "}
              <b>{Math.round(apiData.main?.feels_like)}°C</b>. The humidity level is{" "}
              <b>{apiData.main?.humidity}%</b>, while the wind is blowing at{" "}
              <b>{Math.round(apiData.wind?.speed * 3.6)} km/h</b>. Atmospheric pressure is{" "}
              <b>{apiData.main?.pressure} hPa</b>, and cloud coverage is{" "}
              <b>{apiData.clouds?.all}%</b>. Overall, the weather conditions are{" "}
              <b>{apiData.weather?.[0]?.main.toLowerCase()}</b>, making it a good time to{" "}
              {apiData.weather?.[0]?.main === "Rain"
                ? "carry an umbrella and stay prepared for showers."
                : apiData.weather?.[0]?.main === "Clear"
                  ? "enjoy outdoor activities under clear skies."
                  : apiData.weather?.[0]?.main === "Clouds"
                    ? "expect cloudy skies throughout the day."
                    : "keep an eye on changing weather conditions."}
            </p>
            <div className="weakly-data">
              {forecastData.map((item, index) => (
                <div className="day-data" key={index}>
                  <h1>
                    {Math.round(item.main.temp)}
                    <sup>o</sup>
                    {/* <WiStormShowers className="day-icon dc2" /> */}
                    {/* {item.weather[0].description} */}
                    {getWeatherIcon(item.weather[0].description)}
                  </h1>
                </div>
              ))}
            </div>

            <div className="weakly-days">
              {forecastData.map((item, index) => (
                <h1 key={index}>
                  {new Date(item.dt_txt).toLocaleDateString("en-US", {
                    weekday: isMobile ? "short" : "long",
                  })}
                </h1>
              ))}
            </div>
          </div>
        </div>
      </div >
    </>
  )
}

export default App
