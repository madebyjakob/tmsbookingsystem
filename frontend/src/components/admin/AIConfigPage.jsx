import React from 'react'

export default function AIConfigPage() {
  const [loading, setLoading] = React.useState(true)
  const [saving, setSaving] = React.useState(false)
  const [error, setError] = React.useState('')
  const [config, setConfig] = React.useState({
    serviceTypeBaseHours: { repair: 2.5, maintenance: 1.5, inspection: 1, other: 2 },
    keywordAdjustments: [],
    minHours: 0.5,
    maxHours: 8,
    roundToMinutes: 15,
    openAI: { enabled: true, model: 'gpt-4o-mini', temperature: 0.2 }
  })

  React.useEffect(() => {
    const load = async () => {
      setLoading(true)
      setError('')
      try {
        const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'
        const res = await fetch(`${baseUrl}/ai/config`)
        if (!res.ok) throw new Error('Failed to load config')
        const data = await res.json()
        setConfig(data)
      } catch (e) {
        setError('Kunde inte ladda AI-konfigurationen. Prova igen senare.')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const handleBaseHoursChange = (key, value) => {
    setConfig(prev => ({
      ...prev,
      serviceTypeBaseHours: { ...prev.serviceTypeBaseHours, [key]: Number(value) }
    }))
  }

  const handleAddKeywordRule = () => {
    setConfig(prev => ({
      ...prev,
      keywordAdjustments: [...prev.keywordAdjustments, { pattern: '', flags: 'i', deltaHours: 0 }]
    }))
  }

  const handleKeywordChange = (idx, field, value) => {
    setConfig(prev => {
      const next = [...prev.keywordAdjustments]
      next[idx] = { ...next[idx], [field]: field === 'deltaHours' ? Number(value) : value }
      return { ...prev, keywordAdjustments: next }
    })
  }

  const handleRemoveKeyword = (idx) => {
    setConfig(prev => {
      const next = prev.keywordAdjustments.filter((_, i) => i !== idx)
      return { ...prev, keywordAdjustments: next }
    })
  }

  const handleSave = async () => {
    setSaving(true)
    setError('')
    try {
      const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'
      const res = await fetch(`${baseUrl}/ai/config`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config)
      })
      if (!res.ok) throw new Error('Failed to save config')
      const data = await res.json()
      setConfig(data)
    } catch (e) {
      setError('Kunde inte spara AI-konfigurationen. Prova igen.')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="bg-white text-black py-10">
        <div className="max-w-5xl mx-auto px-4">Laddar...</div>
      </div>
    )
  }

  return (
    <div className="bg-white text-black py-10">
      <div className="max-w-5xl mx-auto px-4">
        <h2 className="text-2xl font-semibold mb-6">AI Konfiguration</h2>

        {error && (
          <div className="mb-4 rounded border border-red-300 bg-red-50 text-red-700 p-3">{error}</div>
        )}

        <div className="grid md:grid-cols-2 gap-8">
          <div>
            <h3 className="font-medium mb-2">Bas-timmar per tjänst</h3>
            <div className="space-y-3">
              {Object.entries(config.serviceTypeBaseHours).map(([key, val]) => (
                <div key={key} className="flex items-center gap-3">
                  <label className="w-32 capitalize">{key}</label>
                  <input type="number" step="0.25" value={val}
                    onChange={e => handleBaseHoursChange(key, e.target.value)}
                    className="border rounded px-2 py-1 w-32" />
                </div>
              ))}
            </div>

            <div className="grid grid-cols-3 gap-4 mt-6">
              <div>
                <label className="block text-sm">Min timmar</label>
                <input type="number" step="0.25" value={config.minHours}
                  onChange={e => setConfig(prev => ({ ...prev, minHours: Number(e.target.value) }))}
                  className="border rounded px-2 py-1 w-full" />
              </div>
              <div>
                <label className="block text-sm">Max timmar</label>
                <input type="number" step="0.25" value={config.maxHours}
                  onChange={e => setConfig(prev => ({ ...prev, maxHours: Number(e.target.value) }))}
                  className="border rounded px-2 py-1 w-full" />
              </div>
              <div>
                <label className="block text-sm">Avrundning (min)</label>
                <input type="number" step="5" value={config.roundToMinutes}
                  onChange={e => setConfig(prev => ({ ...prev, roundToMinutes: Number(e.target.value) }))}
                  className="border rounded px-2 py-1 w-full" />
              </div>
            </div>
          </div>

          <div>
            <h3 className="font-medium mb-2">OpenAI</h3>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <label className="w-32">Aktiverad</label>
                <input type="checkbox" checked={!!config.openAI?.enabled}
                  onChange={e => setConfig(prev => ({ ...prev, openAI: { ...prev.openAI, enabled: e.target.checked } }))} />
              </div>
              <div className="flex items-center gap-3">
                <label className="w-32">Model</label>
                <input type="text" value={config.openAI?.model || ''}
                  onChange={e => setConfig(prev => ({ ...prev, openAI: { ...prev.openAI, model: e.target.value } }))}
                  className="border rounded px-2 py-1 w-64" />
              </div>
              <div className="flex items-center gap-3">
                <label className="w-32">Temperatur</label>
                <input type="number" step="0.05" value={config.openAI?.temperature ?? 0.2}
                  onChange={e => setConfig(prev => ({ ...prev, openAI: { ...prev.openAI, temperature: Number(e.target.value) } }))}
                  className="border rounded px-2 py-1 w-32" />
              </div>
              <p className="text-xs text-gray-600">Lägg din API-nyckel i serverns miljövariabel OPENAI_API_KEY.</p>
            </div>

            <h3 className="font-medium mt-8 mb-2">Nyckelord-regler</h3>
            <div className="space-y-3">
              {config.keywordAdjustments.map((rule, idx) => (
                <div key={idx} className="border rounded p-3">
                  <div className="flex flex-wrap gap-3 items-center">
                    <div>
                      <label className="block text-sm">Regex</label>
                      <input type="text" value={rule.pattern}
                        onChange={e => handleKeywordChange(idx, 'pattern', e.target.value)}
                        className="border rounded px-2 py-1 w-64" />
                    </div>
                    <div>
                      <label className="block text-sm">Flags</label>
                      <input type="text" value={rule.flags || 'i'}
                        onChange={e => handleKeywordChange(idx, 'flags', e.target.value)}
                        className="border rounded px-2 py-1 w-24" />
                    </div>
                    <div>
                      <label className="block text-sm">Delta (h)</label>
                      <input type="number" step="0.25" value={rule.deltaHours}
                        onChange={e => handleKeywordChange(idx, 'deltaHours', e.target.value)}
                        className="border rounded px-2 py-1 w-28" />
                    </div>
                    <button onClick={() => handleRemoveKeyword(idx)} className="text-red-600 hover:underline">Ta bort</button>
                  </div>
                </div>
              ))}
              <button onClick={handleAddKeywordRule} className="border rounded px-3 py-1">Lägg till regel</button>
            </div>
          </div>
        </div>

        <div className="mt-8">
          <button onClick={handleSave} disabled={saving}
            className={`px-4 py-2 rounded text-white ${saving ? 'bg-gray-500' : 'bg-black hover:bg-gray-800'}`}>
            {saving ? 'Sparar...' : 'Spara konfiguration'}
          </button>
        </div>
      </div>
    </div>
  )
}


