// Getting random longitude and latitude

const btnSearch = document.querySelector('.btn-search-country');
const countryContainer = document.querySelector('.country-container');
const map = L.map('map');

btnSearch.addEventListener('click', getCoords);

function getCoords() {
  const from = -90;
  const to = 90;
  const fromLng = -180;
  const toLng = 180;
  const fixed = 5;

  const lat = (Math.random() * (to - from) + from).toFixed(fixed) * 1;
  const lng = (Math.random() * (toLng - fromLng) + fromLng).toFixed(fixed) * 1;

  const coords = [lat, lng];

  countryContainer.innerHTML = '';

  map.setView(coords, 3);

  const renderCountry = function (data, className = '') {
    const html = `
      <article class="country ${className}">
              <img class="country__img" src="${data.flag}" />
              <div class="country__data">
                <h3 class="country__name">${data.name}</h3>
                <h4 class="country__region">${data.region}</h4>
                <p class="country__row"><span>👫</span>${(
                  +data.population / 1000000
                ).toFixed(3)} M people</p>
                <p class="country__row"><span>🗣️</span>${
                  data.languages[0].name
                }</p>
                <p class="country__row"><span>💰</span>${
                  data.currencies[0].name
                }</p>
                <p class="country__row"><span>🗺 </span>${data.region}</p>
              </div>
            </article>
            `;

    countryContainer.insertAdjacentHTML('beforeend', html);
  };

  // Get country by coords
  fetch(
    `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lng}&localityLanguage=en`
  )
    .then(res => {
      if (!res.ok) throw new Error(`Problem with geocoding`);
      return res.json();
    })
    .then(data => {
      console.log(data);
      console.log(data.countryName);

      if (!data.countryName) {
        getCoords();

        L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
          // attribution:
          //   '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        }).addTo(map);
        return;
      }

      const countryNameMapping = {
        Antarctica: 'Antarctic',
        'United States of America (the)': 'usa',
        'Russian Federation (the)': 'russia',
        Congo: 'congo',
      };

      if (countryNameMapping[data.countryName]) {
        data.countryName = countryNameMapping[data.countryName];
      }

      L.marker(coords).addTo(map).bindPopup(`${lat}, ${lng}`).openPopup();

      // Show countries

      return fetch(`https://restcountries.com/v2/name/${data.countryName}`);
    })
    .then(res => {
      // console.log(res.ok);
      if (res.ok === 0) throw new Error(`Country not found!`);
      return res.json();
    })

    .then(data => renderCountry(data[0]))
    .catch(err => console.error(`${err.message}`));
}
