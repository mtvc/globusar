document.addEventListener('DOMContentLoaded', function () {
  // Initialize the map
  const map = L.map('map').setView([0, 0], 2);

  // Add the tile layer
  L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
  }).addTo(map);

  const btnSearch = document.querySelector('.btn-search-country');
  const countryContainer = document.querySelector('.country-container');
  let marker;

  btnSearch.addEventListener('click', getCoords);

  function getCoords() {
    const from = -90;
    const to = 90;
    const fromLng = -180;
    const toLng = 180;
    const fixed = 5;

    const lat = (Math.random() * (to - from) + from).toFixed(fixed) * 1;
    const lng =
      (Math.random() * (toLng - fromLng) + fromLng).toFixed(fixed) * 1;

    const coords = [lat, lng];

    countryContainer.innerHTML = '';

    map.setView(coords, 2);

    // Remove previous marker if exists
    if (marker) {
      map.removeLayer(marker);
    }

    const renderCountry = function (data, className = '') {
      const isIndependent =
        data.independent === true ? 'Independent' : 'Not independent';
      const html = `
        <article class="country ${className}">
                <img class="country__img" src="${data.flag}" />
                <div class="country__data">
                  <h3 class="country__name">${data.name}</h3>
                  <h4 class="country__region">${data.region}</h4>
                  <p class="country__row"><span>👫 </span>${(
                    +data.population / 1000000
                  ).toFixed(3)} M people</p>
                  <p class="country__row"><span>🗣️ </span>${
                    data.languages[0].name
                  }</p>
                  <p class="country__row"><span>💰 </span>${
                    data.currencies[0].name
                  }</p>
                    <p class="country__row"><span>🚩 </span>${isIndependent}</p>
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

        if (!data.countryName || data.countryName === 'Antarctica') {
          getCoords();

          L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution:
              '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
          }).addTo(map);
          return;
        }

        const countryNameMapping = {
          'United States of America (the)': 'usa',
          'Russian Federation (the)': 'russia',
          'Congo (the Democratic Republic of the)': 'congo',
          'Sudan (the)': 'sudan',
        };

        if (countryNameMapping[data.countryName]) {
          data.countryName = countryNameMapping[data.countryName];
        }

        marker = L.marker(coords)
          .addTo(map)
          .bindPopup(`${data.city}<br/>${data.locality}`)
          // .bindPopup(`${lat}, ${lng}`)
          .openPopup();

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
});
