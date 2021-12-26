import React, {useEffect, useState} from 'react';
import {connect} from 'react-redux';
import {bindActionCreators, Dispatch} from 'redux';
import {style} from 'typestyle';
import AppError from '../../components/AppError';
import {RootAction as Action, RootState} from '../../reducers';
import ControlPanel from '../ControlPanel';
import CursorPositionInfo from '../CursorPositionInfo';
import MapVis from '../MapVis';
import {setFrameRate} from './actions';

const mapStateToProps = (state: RootState) => ({
  glUnavailable: state.app.glUnavailable,
});
const mapDispatchToProps = (dispatch: Dispatch<Action>) =>
  bindActionCreators(
    {
      setFrameRate,
    },
    dispatch,
  );

interface AppProps {
  glUnavailable: boolean;
  setFrameRate: (frameRate: number) => Action;
}
function App({glUnavailable}: AppProps) {
  const [width, setWidth] = useState(window.innerWidth);
  const [height, setHeight] = useState(window.innerHeight);

  useEffect(() => {
    window.addEventListener('resize', () => {
      setWidth(window.innerWidth);
      setHeight(window.innerHeight);
    });
  }, []);

  const className = style({
    display: 'grid',
    width: '100%',
    height: '100%',
    gridTemplateRows: 'auto 1fr auto',
    gridTemplateColumns: 'auto 1fr auto',
    gridTemplateAreas: `".... . ......."
                          ".... . ......."
                          "info . control"`,
    backgroundColor: '#624a72',
  });

  return glUnavailable ? (
    <div id="app" className={className}>
      <AppError>
        Not available in this browser, please try another one!
      </AppError>
    </div>
  ) : (
    <div id="app" className={className}>
      <MapVis width={width} height={height} />
      <ControlPanel windowWidth={width} windowHeight={height} />
      <CursorPositionInfo />
    </div>
  );
}

export default connect(mapStateToProps, mapDispatchToProps)(App);
