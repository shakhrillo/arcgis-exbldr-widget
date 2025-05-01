/** @jsx jsx */
import { css, jsx } from '@emotion/react';
import type { AllWidgetSettingProps } from 'jimu-for-builder'
import {
  MapWidgetSelector,
  SettingSection,
  SettingRow
} from 'jimu-ui/advanced/setting-components'
import type { IMConfig } from '../config'
import defaultI18nMessages from './translations/default'

export default function (props: AllWidgetSettingProps<IMConfig>) {

  const onMapWidgetSelected = (useMapWidgetIds: string[]) => {
    props.onSettingChange({
      id: props.id,
      useMapWidgetIds: useMapWidgetIds
    })
  }

  const style = css`
      .widget-setting-get-map-coordinates {
        .checkbox-row {
          display: flex;
          justify-content: space-between;
          margin-bottom: 8px;
        }
      }
    `
  return (
    <div css={style}>
      <div className="widget-setting-get-map-coordinates">
        <SettingSection
          className="map-selector-section"
          title={props.intl.formatMessage({
            id: 'mapWidgetLabel',
            defaultMessage: defaultI18nMessages.selectMapWidget
          })}
        >
          <SettingRow>
            <MapWidgetSelector
              onSelect={onMapWidgetSelected}
              useMapWidgetIds={props.useMapWidgetIds}
            />
          </SettingRow>
        </SettingSection>
      </div>
    </div>
  )
}