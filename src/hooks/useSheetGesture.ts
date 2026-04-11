import { useMemo } from 'react';
import { Gesture } from 'react-native-gesture-handler';
import { runOnJS } from 'react-native-reanimated';

const SWIPE_THRESHOLD = 40;

/**
 * Returns a composed gesture (Pan + Tap) for a bottom sheet drag handle.
 * Swipe up → expand, swipe down → collapse, tap → toggle.
 */
export function useSheetGesture(
  expanded: boolean,
  setExpanded: (v: boolean) => void,
) {
  const drag = useMemo(() =>
    Gesture.Pan().onEnd((e) => {
      if (e.translationY < -SWIPE_THRESHOLD) runOnJS(setExpanded)(true);
      else if (e.translationY > SWIPE_THRESHOLD) runOnJS(setExpanded)(false);
    }),
    []
  );

  const tap = useMemo(() =>
    Gesture.Tap().onEnd(() => {
      runOnJS(setExpanded)(!expanded);
    }),
    [expanded]
  );

  return useMemo(() => Gesture.Race(drag, tap), [drag, tap]);
}
