'use client'
import { useEffect, useRef } from 'react'
import { useStore } from '@/lib/store'
import { supabase } from '@/lib/supabase'

const SYNC_KEY = 'ritsuki'
const DEBOUNCE_MS = 2000

export default function SupabaseSync() {
  const initialized = useRef(false)
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)

  useEffect(() => {
    if (!supabase) return

    // 起動時にSupabaseからデータを読み込む
    async function load() {
      const { data: row } = await supabase!
        .from('app_state')
        .select('data')
        .eq('id', SYNC_KEY)
        .single()

      const hasRealData = row?.data &&
        ((row.data.tasks?.length ?? 0) > 0 || (row.data.subjects?.length ?? 0) > 0)

      if (hasRealData) {
        const d = row!.data
        const s = useStore.getState()
        if (d.subjects !== undefined || d.tasks !== undefined) s.importData(d)
        if (d.sidebarIcon !== undefined) s.setSidebarIcon(d.sidebarIcon)
        if (d.bgImage !== undefined) s.setBgImage(d.bgImage)
        if (d.bgImageMobile !== undefined) s.setBgImageMobile(d.bgImageMobile)
        if (d.bgPosition !== undefined) s.setBgPosition(d.bgPosition)
        if (d.bgPositionMobile !== undefined) s.setBgPositionMobile(d.bgPositionMobile)
        if (d.language) s.setLanguage(d.language)
        if (d.freeNote !== undefined) s.updateFreeNote(d.freeNote)
        if (d.integrations) s.updateIntegrations(d.integrations)
      } else {
        // Supabaseにデータなし → PCのlocalStorageデータをSupabaseに書き込む
        const s = useStore.getState()
        const data = {
          ...s.exportData(),
          sidebarIcon: s.sidebarIcon,
          bgImage: s.bgImage,
          bgImageMobile: s.bgImageMobile,
          bgPosition: s.bgPosition,
          bgPositionMobile: s.bgPositionMobile,
          language: s.language,
          freeNote: s.freeNote,
          integrations: s.integrations,
        }
        await supabase!
          .from('app_state')
          .upsert({ id: SYNC_KEY, data, updated_at: new Date().toISOString() })
      }
      initialized.current = true
    }
    load()

    // 状態が変わるたびにSupabaseへ保存（2秒デバウンス）
    const unsubscribe = useStore.subscribe(() => {
      if (!initialized.current) return
      clearTimeout(timer.current)
      timer.current = setTimeout(async () => {
        const s = useStore.getState()
        const data = {
          ...s.exportData(),
          sidebarIcon: s.sidebarIcon,
          bgImage: s.bgImage,
          bgImageMobile: s.bgImageMobile,
          bgPosition: s.bgPosition,
          bgPositionMobile: s.bgPositionMobile,
          language: s.language,
          freeNote: s.freeNote,
          integrations: s.integrations,
        }
        await supabase!
          .from('app_state')
          .upsert({ id: SYNC_KEY, data, updated_at: new Date().toISOString() })
      }, DEBOUNCE_MS)
    })

    return () => {
      unsubscribe()
      clearTimeout(timer.current)
    }
  }, [])

  return null
}
