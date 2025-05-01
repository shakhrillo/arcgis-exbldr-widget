/* eslint-disable no-prototype-builtins */
/** @jsx jsx */
import { jsx } from '@emotion/react';
import type { AllWidgetProps } from 'jimu-core';
import { useState } from 'react'
import type { IMConfig } from '../config'
import { type JimuMapView, JimuMapViewComponent } from 'jimu-arcgis'

import FeatureLayer from '@arcgis/core/layers/FeatureLayer';


export default function (props: AllWidgetProps<IMConfig>) {
  const [mapView, setMapView] = useState<JimuMapView>(null)
  const [layerList, setLayerList] = useState<any>(null)

  const activeViewChange = (views: { [viewId: string]: JimuMapView }) => {
    const jmv = Object.values(views)[0] // Get the first JimuMapView from the views object
    if (jmv) {
      setMapView(jmv)
      console.log('activeViewChange', jmv)
      setLayerList(jmv.view.allLayerViews)

      // Find layer title AGIL_190208
      const layer = jmv.view.allLayerViews.find((layer: any) => {
        return layer.layer.title === 'AGIL 190208'
      })

      const url = (layer?.layer as __esri.FeatureLayer)?.url

      const _layer = new FeatureLayer({
        url
      });

      const query = _layer.createQuery();
      query.where = '1=1'; // get all features
      query.outFields = ['*']; // or specific fields
      query.returnGeometry = true;

      _layer.queryFeatures(query).then((result) => {
        const features = result.features;
        features.forEach(feature => {
          console.log('feature', feature);
          const geometry = feature.geometry; // e.g., Point
          const attributes = feature.attributes;

          console.log("Coordinates:", geometry);
          console.log("Attributes:", attributes);
        });
      });
    }
  }

  return (
    <div className="widget-get-map-coordinates jimu-widget m-2">
      {props.hasOwnProperty('useMapWidgetIds') &&
        props.useMapWidgetIds &&
        props.useMapWidgetIds.length === 1 && (
          <JimuMapViewComponent
            useMapWidgetId={props.useMapWidgetIds?.[0]}
            onViewsCreate={activeViewChange}
          />
        )}

      <ul>
        {layerList &&
          layerList
          .map((layer: any, index: number) => {
            return (
              <li key={index}>
                {layer.layer.title}
              </li>
            )
          })}
        {layerList && layerList.length === 0 && (
          <li>
            No layers in the map.
          </li>
        )}
      </ul>
    </div>
  )
}