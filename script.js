"use strict";

// prettier-ignore
const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

//////////////////////////////////////////
class Workout {
  // date and id are fields
  date = new Date();
  id = (Date.now() + "").slice(-10);
  constructor(coords, distance, duration) {
    this.coords = coords; // [lat, lng]
    this.distance = distance; // in km
    this.duration = duration; // in min
  }
}

//////////////////////////////////
// child class
class Running extends Workout {
  type = "running";
  constructor(coords, distance, duration, cadence) {
    // need to call super() method with the common arguments coming from the parent class (Workout)
    super(coords, distance, duration);
    this.cadence = cadence;
    this.calcPace();
  }

  // creating a method for calculating the pace
  calcPace() {
    // min in km
    this.pace = this.duration / this.distance;
    return this.pace;
  }
}

/////////////////////////////////////
// child class
class Cycling extends Workout {
  // defining a field here
  type = "cycling"; //  a property that is goning to avaliable on all instances
  constructor(coords, distance, duration, elevationGain) {
    // need to call super() method with the common arguments coming from the parent class (Workout)
    super(coords, distance, duration);
    this.elevationGain = elevationGain;
    // this.type = "cycling";
    this.calcSpeed();
  }

  // creating a method for calculating the speed
  calcSpeed() {
    // km/h
    this.speed = this.distance / (this.duration / 60);
    return this.speed;
  }
}

//////////////////////////////////////////////////
// for experiment only!
// const run1 = new Running([39, -12], 5.2, 24, 178);
// const cyling1 = new Cycling([39, -12], 27, 95, 523);
// console.log(run1, cyling1);

//////////////////////////////////
// Application Architecture
const form = document.querySelector(".form");
const containerWorkouts = document.querySelector(".workouts");
const inputType = document.querySelector(".form__input--type");
const inputDistance = document.querySelector(".form__input--distance");
const inputDuration = document.querySelector(".form__input--duration");
const inputCadence = document.querySelector(".form__input--cadence");
const inputElevation = document.querySelector(".form__input--elevation");
class App {
  // Private instance properties
  #map; // class field
  #mapEvent;
  #workouts = [];

  constructor() {
    this.workout = [];
    this._getPosition();
    form.addEventListener("submit", this._newWorkout.bind(this));
    inputType.addEventListener("change", this._toggleElevationField);
  }

  _getPosition() {
    if (navigator.geolocation)
      navigator.geolocation.getCurrentPosition(
        this._loadMap.bind(this),
        function () {
          alert("Could not get your position");
        }
      );
  }

  _loadMap(position) {
    const { latitude } = position.coords;
    const { longitude } = position.coords;
    console.log(`https://www.google.com/maps/@${latitude},${longitude}`);

    const coords = [latitude, longitude];

    // console.log(this);
    this.#map = L.map("map").setView(coords, 13);
    //   console.log(map);

    L.tileLayer("https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png", {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(this.#map);

    // Handling clicks on map
    this.#map.on("click", this._showForm.bind(this));
  }

  _showForm(mapE) {
    this.#mapEvent = mapE;
    form.classList.remove("hidden");
    inputDistance.focus();
  }

  _toggleElevationField() {
    inputElevation.closest(".form__row").classList.toggle("form__row--hidden");
    inputCadence.closest(".form__row").classList.toggle("form__row--hidden");
  }

  _newWorkout(e) {
    // 1) small helper function
    // remember when we use rest parameters (...inputs) then we get an array and now we want to loop over this array
    const validInputs = (...inputs) =>
      inputs.every((inp) => Number.isFinite(inp));
    // 2) small helper functiion
    // checks if all numbers are positive
    const allPositive = (...inputs) => inputs.every((inp) => inp > 0);

    e.preventDefault();

    // Get data from the form
    const type = inputType.value;
    // the plus + here is to convert the String data type to number data type
    const distance = +inputDistance.value;
    const duration = +inputDuration.value;
    const { lat, lng } = this.#mapEvent.latlng;
    let workout;

    // If workout running, create running object
    if (type === "running") {
      const cadence = +inputCadence.value;
      // Check if data is valid
      // if the distance not a number
      if (
        // !Number.isFinite(distance) ||
        // !Number.isFinite(duration) ||
        // !Number.isFinite(cadence)

        // if all these elements are numbers then validInputs will become true
        !validInputs(distance, duration, cadence) ||
        !allPositive(distance, duration, cadence)
      )
        return alert(`Inputs have to be positive numbers!`);

      workout = new Running([lat, lng], distance, duration, cadence);
    }

    // If workout cyling, create cycling object
    if (type === "cycling") {
      const elevation = +inputElevation.value;

      if (
        !validInputs(distance, duration, elevation) ||
        !allPositive(distance, duration)
      )
        return alert(`Inputs have to be positive numbers!`);

      workout = new Cycling([lat, lng], distance, duration, elevation);
    }

    // Add new object to workout array
    this.#workouts.push(workout);
    console.log(workout);

    // Render workout on map as a marker
    this.renderWoroutMarker(workout);

    // Render workout on the list

    // Hide the form + clear Input fields
    inputDistance.value =
      inputDuration.value =
      inputCadence.value =
      inputElevation.value =
        "";
  }

  renderWoroutMarker(workout) {
    L.marker(workout.coords)
      .addTo(this.#map)
      .bindPopup(
        L.popup({
          maxWidth: 250,
          minWidth: 100,
          autoClose: false,
          closeOnClick: false,
          className: `${workout.type}-popup`,
        })
      )
      .setPopupContent("workout.distance")
      .openPopup();
  }
}

const app = new App();
