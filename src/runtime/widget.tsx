/** @jsx jsx */
import { type AllWidgetProps, jsx } from 'jimu-core'
import { useEffect, useState } from 'react'
import type { IMConfig } from '../config'
import { type JimuMapView, JimuMapViewComponent } from 'jimu-arcgis'

import FeatureLayer from '@arcgis/core/layers/FeatureLayer';
import { Button, Card, CardBody, CardFooter } from 'jimu-ui';
import { MoreHorizontalOutlined } from 'jimu-icons/outlined/application/more-horizontal';

function FeautureLayerCard(props: { mapView, layer: any, selectFeautures: any }) {
  const { layer, mapView, selectFeautures } = props
  const [features, setFeatures] = useState<any>([])
  const [loading, setLoading] = useState<boolean>(false)

  const getFeatures = async () => {
    setLoading(true)
    const query = layer.createQuery()
    query.where = '1=1' // get all features
    query.outFields = ['*'] // or specific fields
    query.returnGeometry = true

    const result = await layer.queryFeatures(query)
    const features = result.features
    setFeatures(features)
    setLoading(false)
  }
  
  useEffect(() => {
    if (layer.loaded) {
      getFeatures()
    } else {
      layer.when(() => {
        getFeatures()
      })
    }
  }, [layer])


  const zoomToLayer = () => {
    if (mapView) {
      const extent = layer.fullExtent
      mapView.view.goTo(extent).catch((err) => {
        console.error('Error zooming to layer:', err)
      })
    }
  }
  
  return (
    <Card>
      <CardBody>
        <h5>
          {layer.title}
        </h5>
        <Button onClick={zoomToLayer} color='primary' size='sm'>
          Zoom to Layer
        </Button>
      </CardBody>
      <CardFooter className='d-flex justify-content-between'>
        Found {features.length} features
        <Button
          className='float-end'
          size='sm'
          color='secondary'
          onClick={(e) => {
            e.stopPropagation()
            selectFeautures(features)
          }}
        >
          Open features
        </Button>
      </CardFooter>
    </Card>
  )
}

export default function (props: AllWidgetProps<IMConfig>) {
  const [mapView, setMapView] = useState<JimuMapView>(null)
  const [layerList, setLayerList] = useState<any>([])
  const [features, setFeatures] = useState<any>([])

  const activeViewChange = (views: { [viewId: string]: JimuMapView }) => {
    const jmv = Object.values(views)[0] // Get the first JimuMapView from the views object
    if (jmv) {
      setMapView(jmv)
      console.log('activeViewChange', jmv)
      setLayerList(jmv.view.allLayerViews)
      console.log('layerList', jmv.view.allLayerViews)
    }
  }

  return (
    <div>
      {'useMapWidgetIds' in props &&
       props.useMapWidgetIds &&
       props.useMapWidgetIds.length === 1 && (
         <JimuMapViewComponent
           useMapWidgetId={props.useMapWidgetIds?.[0]}
           onViewsCreate={activeViewChange}
           onViewsChange={activeViewChange}
         />
       )}
      <div className='d-flex flex-row'>
        <div className='d-flex flex-column'>
          {
            layerList
              .filter((layer: any) => {
                return layer.layer.type === 'feature'
              })
              .map((layer: any, index: number) => {
              return <FeautureLayerCard mapView={mapView} layer={layer.layer} key={index} selectFeautures={(features: any) => {
                console.log('selectFeautures', features)
                setFeatures(features)
              }} />
            })
          }
        </div>
        <div className='d-flex flex-column'>
          {
            features && features.length > 0 && (
              <Card>
                <CardBody className='d-flex flex-column' style={{ maxHeight: '400px', overflowY: 'auto' }}>
                  <h5>
                    Selected Features
                  </h5>
                  {features.map((feature: any, index: number) => {
                    return (
                      <div key={index} className='border-bottom' onMouseOver={() => {
                        if (mapView) {
                          mapView.view.goTo(feature.geometry.extent).catch((err) => {
                            console.error('Error zooming to feature:', err)
                          })
                        }
                      }}>
                        {
                          Object.keys(feature.attributes).map((key: string) => {
                            return (
                              <div key={key}>
                                {key}: {feature.attributes[key]}
                              </div>
                            )
                          })
                        }
                      </div>
                    )
                  })}
                </CardBody>
              </Card>
            )
          }
        </div>
      </div>
    </div>
  )
}