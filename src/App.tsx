import classes from "./App.module.scss";

import Map from "./components/map/Map";

function App() {
  return (
    <div className={classes.page}>
      <Map />
    </div>
  );
}

export default App;
