import { Box } from '@mujo/box'
import { Tab, Setting } from '@mujo/plugins'
import {
  useTheme,
  HeaderS,
  Sup,
  BodyS,
  Graph,
  Switch,
  ToolTip,
  Modal,
} from '@mujo/ui'
import { Aggregation } from '@mujo/utils'
import React, { useState, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import {
  TRANSLATION_FILE,
  SCREEN_TIME_PERMISSIONS,
} from '../../constants'
import { useExtension } from '../../hooks/use-extension'
import { usePermissions } from '../../hooks/use-permissions'
import { NotEnoughData, hasEnoughData } from './not-enough-data'
import { reduceSegmentToUrls } from './reducer'

const { siteTimeToChartData } = Aggregation

export const ScreenTime = () => {
  const {
    siteTimesAndTimers: data,
    setBreakTimer,
    selectedSegment,
    setSelectedSegment,
  } = useExtension()
  const { t } = useTranslation(TRANSLATION_FILE)
  const {
    hasPermission,
    requestPermissions,
    removePermissions,
  } = usePermissions(SCREEN_TIME_PERMISSIONS)
  const [toolTipOpen, setToolTipOpen] = useState(false)
  const graphData = siteTimeToChartData(data)
  const theme = useTheme()
  const { foreground, highlight } = theme
  const showGraph = hasEnoughData(graphData, data)
  const status = hasPermission ? t('enabled') : t('disabled')
  const onSettingsChange = useCallback(() => {
    if (hasPermission) {
      removePermissions()
    } else {
      requestPermissions()
    }
  }, [hasPermission, removePermissions, requestPermissions])
  return (
    <>
      <Setting
        label={t('screen-time-enabled')}
        alt={t('screen-time-permissions')}
        type="boolean"
        onChange={onSettingsChange}
        value={hasPermission}
      />
      <Tab name={t('screen-time')}>
        <Box
          flex="1"
          display="flex"
          direction="column"
          justifyContent="center"
          alignItems="center"
          textAlign="center"
          position="relative"
          layer="1"
        >
          <HeaderS
            position="relative"
            cursor="pointer"
            color={foreground}
            onMouseLeave={() => setToolTipOpen(false)}
            onMouseEnter={() => setToolTipOpen(true)}
          >
            {t('screen-time')} <Sup>{t('beta')}</Sup>
            <ToolTip isOpen={toolTipOpen}>
              {t('screen-time-explain')}
            </ToolTip>
          </HeaderS>
          {showGraph ? (
            <Graph
              data={graphData}
              width={600}
              height={275}
              strokeWidth={16}
              textFill={foreground}
              stroke={highlight}
              spacingAngle={16}
              strokeLinecap="round"
              radius={100}
              selected={selectedSegment}
              selectedStroke={foreground}
              onSegmentClick={seg =>
                setSelectedSegment(reduceSegmentToUrls(seg))
              }
            />
          ) : (
            <NotEnoughData />
          )}
          <Box display="flex" direction="row">
            <Box
              display="flex"
              justifyContent="center"
              alignItems="center"
            >
              <Switch
                onChange={() => {
                  if (hasPermission) {
                    removePermissions()
                  } else {
                    requestPermissions()
                  }
                }}
                value={hasPermission}
              />
            </Box>
            <BodyS flex="1" paddingLeft="m">
              {t('screen-time-status', { status })}
            </BodyS>
          </Box>

          <Modal
            isOpen={!!selectedSegment}
            theme={theme}
            setSelectedSegment={setSelectedSegment}
            selectedSegment={selectedSegment}
            allSegments={graphData}
            setBreakTimer={setBreakTimer}
          />
        </Box>
      </Tab>
    </>
  )
}

ScreenTime.defaultProps = { data: {} }
