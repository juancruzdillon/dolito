<template>
  <div class="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <div class="mb-8">
      <h1 class="section-title text-3xl">Calculadoras financieras</h1>
      <p class="section-subtitle">Todos los cálculos son reales y precisos. Ingresá los datos y obtené resultados instantáneos.</p>
    </div>

    <!-- Tab selector -->
    <div class="flex flex-wrap gap-2 mb-8 p-1 rounded-2xl w-fit" :style="{ background: 'var(--surface-2)' }">
      <button
        v-for="tab in tabs"
        :key="tab.id"
        @click="activeTab = tab.id"
        class="px-4 py-2 rounded-xl text-sm font-medium transition-all"
        :class="activeTab === tab.id
          ? 'shadow-sm'
          : 'hover:opacity-80'"
        :style="activeTab === tab.id
          ? { background: 'var(--surface)', color: 'var(--text)' }
          : { color: 'var(--text-3)' }"
      >
        {{ tab.label }}
      </button>
    </div>

    <!-- ─── ALQUILER (DOLITO LIGHT DESIGN) ─── -->
    <div v-if="activeTab === 'alquiler'" class="max-w-4xl mx-auto py-8">
      <div class="bg-white rounded-3xl border border-slate-100 shadow-sm p-8 sm:p-10 mb-8 transition-all">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-10">
          <h2 class="text-xl font-bold text-slate-800">Calculadora de alquiler</h2>
          
          <div class="flex gap-1 p-1 bg-slate-100 rounded-xl w-fit">
            <button 
              v-for="idx in ['ipc', 'icl']" :key="idx"
              @click="alq.indice = idx"
              class="px-4 py-1.5 rounded-lg text-xs font-bold transition-all uppercase tracking-wide"
              :class="alq.indice === idx ? 'bg-[#34D399] text-white shadow-sm' : 'text-slate-500 hover:bg-slate-200'"
            >
              {{ idx }}
            </button>
          </div>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-x-10 gap-y-8">
          <!-- Precio Inicial -->
          <div>
            <label class="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2.5">Precio inicial del alquiler</label>
            <div class="relative">
              <span class="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-medium">$</span>
              <input 
                v-model.number="alq.monto" 
                type="number" 
                class="w-full bg-slate-50 border border-slate-100 rounded-2xl h-14 pl-8 pr-6 text-lg font-bold text-slate-700 focus:bg-white focus:ring-2 focus:ring-[#34D399] transition-all"
                placeholder="350000"
              />
            </div>
          </div>

          <!-- Fecha de Inicio (CUSTOM MINIMALIST PICKER) -->
          <div class="relative" ref="datePickerRef">
            <label class="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2.5">Fecha de inicio de contrato</label>
            <div 
              @click="showDatePicker = !showDatePicker"
              class="w-full bg-slate-50 border border-slate-100 rounded-2xl h-14 px-6 flex items-center justify-between cursor-pointer hover:bg-white hover:border-[#34D399]/30 transition-all"
            >
              <span class="text-lg font-bold text-slate-700">
                {{ alq.fechaInicio ? dayjs(alq.fechaInicio).format('DD / MM / YYYY') : 'Seleccionar fecha' }}
              </span>
              <CalendarIcon class="w-5 h-5 text-slate-300" />
            </div>

            <!-- Custom Calendar Popover (RESPONSIVE MODAL) -->
            <Teleport to="body">
              <div 
                v-if="showDatePicker"
                class="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-0 sm:absolute sm:inset-auto sm:top-full sm:left-0 sm:mt-3 overflow-hidden"
                :style="isMobile ? {} : datePickerDesktopStyle"
              >
                <!-- Backdrop (Mobile Only) -->
                <div 
                  @click="showDatePicker = false"
                  class="fixed inset-0 bg-slate-900/40 backdrop-blur-sm sm:hidden"
                ></div>

                <!-- Calendar Card -->
                <div 
                  ref="datePickerContentRef"
                  class="relative w-full max-w-[340px] sm:w-[320px] bg-white rounded-[2rem] shadow-2xl border border-slate-100 p-6 sm:p-8 animate-in fade-in zoom-in duration-200"
                >
                  <!-- Header -->
                  <div class="flex items-center justify-between mb-8 gap-2">
                    <div class="flex items-center gap-1">
                      <button @click="pickerMode === 'days' ? changeYear(-1) : changeYearDecade(-1)" class="p-2 ml-[-8px] rounded-xl hover:bg-slate-50 text-slate-300 hover:text-slate-500 transition-colors">
                        <ChevronsLeftIcon class="w-4 h-4"/>
                      </button>
                      <button @click="pickerMode === 'days' ? changeMonth(-1) : changeYearDecade(-1)" class="p-2 rounded-xl hover:bg-slate-50 text-slate-400 hover:text-slate-600 transition-colors">
                        <ChevronLeftIcon class="w-5 h-5"/>
                      </button>
                    </div>
                    
                    <div class="flex gap-1 items-center text-[13px] font-black uppercase tracking-widest text-slate-800">
                      <button @click="pickerMode = 'days'" :class="pickerMode === 'days' ? 'text-slate-900' : 'text-slate-400'" class="hover:text-[#34D399] transition-colors capitalize">
                        {{ dayjs().month(pickerMonth).format('MMMM') }}
                      </button>
                      <span class="opacity-10 text-[10px]">/</span>
                      <button @click="pickerMode = 'years'" :class="pickerMode === 'years' ? 'text-[#34D399]' : 'text-slate-400'" class="hover:text-[#34D399] transition-colors">
                        {{ pickerYear }}
                      </button>
                    </div>

                    <div class="flex items-center gap-1">
                      <button @click="pickerMode === 'days' ? changeMonth(1) : changeYearDecade(1)" class="p-2 rounded-xl hover:bg-slate-50 text-slate-400 hover:text-slate-600 transition-colors">
                        <ChevronRightIcon class="w-5 h-5"/>
                      </button>
                      <button @click="pickerMode === 'days' ? changeYear(1) : changeYearDecade(1)" class="p-2 mr-[-8px] rounded-xl hover:bg-slate-50 text-slate-300 hover:text-slate-500 transition-colors">
                        <ChevronsRightIcon class="w-4 h-4"/>
                      </button>
                    </div>
                  </div>

                  <!-- Days View -->
                  <div v-if="pickerMode === 'days'" class="animate-in fade-in duration-200">
                    <div class="grid grid-cols-7 gap-1 text-center mb-4">
                      <div v-for="d in ['D','L','M','X','J','V','S']" :key="d" class="text-[10px] font-black text-slate-300 uppercase">{{ d }}</div>
                    </div>

                    <div class="grid grid-cols-7 gap-1">
                      <div v-for="empty in pickerOffset" :key="'empty'+empty" class="h-10"></div>
                      <button 
                        v-for="day in pickerDays" :key="day"
                        @click="selectDay(day)"
                        class="h-10 rounded-2xl text-xs font-bold transition-all flex items-center justify-center active:scale-90"
                        :class="isPickerSelected(day) 
                          ? 'bg-[#34D399] text-white shadow-lg shadow-[#34D399]/30' 
                          : 'text-slate-600 hover:bg-slate-50 hover:text-[#34D399]'"
                      >
                        {{ day }}
                      </button>
                    </div>
                  </div>

                  <!-- Years View (THE NEW GRID) -->
                  <div v-else class="animate-in fade-in zoom-in duration-300">
                    <div class="grid grid-cols-3 gap-3">
                      <button 
                        v-for="y in yearsGrid" :key="y"
                        @click="selectYear(y)"
                        class="py-4 rounded-2xl text-xs font-black transition-all border"
                        :class="y === pickerYear 
                          ? 'bg-[#34D399] border-[#34D399] text-white shadow-lg shadow-[#34D399]/20' 
                          : 'bg-slate-50 border-transparent text-slate-400 hover:bg-white hover:border-slate-100 hover:text-slate-800'"
                      >
                        {{ y }}
                      </button>
                    </div>
                  </div>
                  
                  <div class="mt-8 pt-8 border-t border-slate-50 flex gap-3">
                    <button v-if="pickerMode === 'years'" @click="pickerMode = 'days'" class="flex-1 bg-slate-50 rounded-xl text-[10px] font-black uppercase text-slate-400 hover:bg-slate-100 transition-colors">Volver</button>
                    <button @click="selectDay(dayjs().date())" class="flex-1 bg-slate-100 rounded-xl text-[10px] font-black uppercase text-slate-500 hover:bg-slate-200 transition-colors py-3">Hoy</button>
                  </div>

                  <!-- Close Button (Mobile Only) -->
                  <button 
                    @click="showDatePicker = false"
                    class="w-full mt-4 py-4 bg-slate-50 text-slate-400 text-[10px] font-black uppercase tracking-widest rounded-2xl sm:hidden hover:bg-slate-100 transition-colors"
                  >
                    Cerrar
                  </button>
                </div>
              </div>
            </Teleport>
          </div>

          <!-- Frecuencia -->
          <div class="sm:col-span-2">
            <label class="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2.5">Frecuencia de ajuste</label>
            <div class="flex flex-wrap gap-2">
              <button 
                v-for="freq in [ {v:1, l:'Mensual'}, {v:3, l:'Trimestral'}, {v:4, l:'Cuatrimestral'}, {v:6, l:'Semestral'}, {v:12, l:'Anual'} ]" 
                :key="freq.v"
                @click="alq.frecuencia = freq.v"
                class="px-5 py-2.5 rounded-xl text-xs font-bold transition-all border"
                :class="alq.frecuencia === freq.v 
                  ? 'bg-[#34D399] border-[#34D399] text-white shadow-sm' 
                  : 'bg-slate-100 border-transparent text-slate-500 hover:bg-slate-200'"
              >
                {{ freq.l }}
              </button>
            </div>
          </div>
        </div>

        <button 
          @click="calculateRent"
          class="w-full mt-10 h-16 rounded-2xl bg-[#5942E9] text-white font-black text-sm uppercase tracking-[0.2em] shadow-lg shadow-[#5942E9]/20 hover:brightness-110 active:scale-[0.98] transition-all"
        >
          CALCULAR
        </button>
      </div>

      <!-- Results Brief -->
      <div v-if="calculatedResult" id="rental-result" class="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div class="bg-[#ECFDF5] p-6 rounded-2xl border border-emerald-100/50 text-center">
          <p class="text-[9px] font-black uppercase tracking-widest text-[#065F46]/50 mb-2">Alquiler Proyectado</p>
          <p class="text-xl font-black text-[#047857]">{{ fmt(calculatedResult.nuevoMonto) }}</p>
        </div>
        <div class="bg-slate-50 p-6 rounded-2xl border border-slate-100 text-center">
          <p class="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-2">Aumento Total</p>
          <p class="text-xl font-black text-slate-700">+{{ calculatedResult.totalAumento.toFixed(1) }}%</p>
        </div>
        <div class="bg-[#FEF2F2] p-6 rounded-2xl border border-red-100/50 text-center">
          <p class="text-[9px] font-black uppercase tracking-widest text-[#991B1B]/50 mb-2">Dif. Mensual</p>
          <p class="text-xl font-black text-[#B91C1C]">{{ fmt(calculatedResult.difMensual) }}</p>
        </div>
        <div class="bg-slate-50 p-6 rounded-2xl border border-slate-100 text-center">
          <p class="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-2">Próximos Ajustes</p>
          <p class="text-xl font-black text-slate-700">{{ calculatedResult.proxAjustes }}</p>
        </div>
      </div>

      <!-- Historical Table -->
      <div v-if="calculateRentTable.length > 0" class="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full text-left border-collapse">
            <thead>
              <tr class="bg-slate-50/50 border-bottom border-slate-100">
                <th class="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Período</th>
                <th v-if="alq.indice === 'ipc'" class="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">IPC Mes</th>
                <th class="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Alquiler</th>
                <th class="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400 text-right">Ajuste</th>
              </tr>
            </thead>
            <tbody>
              <tr 
                v-for="(p, i) in calculateRentTable" 
                :key="i"
                class="border-b border-slate-50 last:border-0 hover:bg-slate-50/30 transition-colors"
                :class="p.isAdjustmentMonth ? 'bg-emerald-50/30' : ''"
              >
                <td class="px-6 py-4 text-xs font-bold text-slate-600 uppercase">{{ p.fecha }}</td>
                <td v-if="alq.indice === 'ipc'" class="px-6 py-4 text-xs font-medium text-slate-400">{{ p.ipcMes ? p.ipcMes.toFixed(1) + '%' : '-' }}</td>
                <td class="px-6 py-4 text-xs font-black" :class="p.isAdjustmentMonth ? 'text-[#047857]' : 'text-slate-800'">
                  {{ fmt(p.rent) }}
                </td>
                <td class="px-6 py-4 text-right">
                  <span v-if="p.isStart" class="text-[9px] font-black uppercase px-2 py-1 bg-slate-100 text-slate-400 rounded-md">Inicio</span>
                  <span v-else-if="p.adjustment > 0" class="text-[9px] font-black uppercase px-2 py-1 bg-emerald-100 text-[#047857] rounded-md">
                    ↑ {{ p.adjustment.toFixed(1) }}%
                  </span>
                  <span v-else class="text-slate-300">—</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Share Footer -->
      <div class="mt-16 text-center">
        <p class="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400 mb-8">Compartir esta calculadora</p>
        <div class="flex justify-center gap-6">
          <button class="w-12 h-12 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-[#3B5998] hover:bg-white hover:shadow-xl hover:-translate-y-1 transition-all">
            <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z"></path></svg>
          </button>
          <button class="w-12 h-12 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-black hover:bg-white hover:shadow-xl hover:-translate-y-1 transition-all">
            <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"></path></svg>
          </button>
          <button class="w-12 h-12 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-[#25D366] hover:bg-white hover:shadow-xl hover:-translate-y-1 transition-all">
            <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"></path></svg>
          </button>
        </div>
      </div>
    </div>


    <!-- ─── MEP CON COMISIONES ─── -->
    <div v-if="activeTab === 'mep'" class="space-y-6">
      <div class="card p-6">
        <h2 class="font-semibold mb-1" :style="{ color: 'var(--text)' }">Dólar MEP real por broker</h2>
        <p class="text-xs mb-6" :style="{ color: 'var(--text-3)' }">Calculá cuántos dólares realmente recibís según el broker que uses</p>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          <div>
            <label class="block text-xs font-medium mb-1.5" :style="{ color: 'var(--text-2)' }">Pesos a invertir</label>
            <div class="relative">
              <span class="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm" :style="{ color: 'var(--text-3)' }">$</span>
              <input v-model.number="mep.amount" type="number" class="input-field pl-7" min="1000" />
            </div>
          </div>
          <div>
            <label class="block text-xs font-medium mb-1.5" :style="{ color: 'var(--text-2)' }">Cotización MEP mercado (venta)</label>
            <input v-model.number="mep.marketRate" type="number" class="input-field" placeholder="ej. 1200" />
          </div>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <div
            v-for="(r, i) in mepBrokerResults"
            :key="r.broker.id"
            class="rounded-xl border p-4"
            :style="i === 0
              ? { borderColor: 'rgba(52,211,153,.35)', background: 'var(--green-bg)' }
              : { borderColor: 'var(--border)' }"
          >
            <span v-if="i === 0" class="text-[10px] font-bold uppercase tracking-wide" :style="{ color: 'var(--green)' }">★ Mejor opción</span>
            <p class="font-semibold text-sm mt-1" :style="{ color: r.broker.color }">{{ r.broker.name }}</p>
            <p class="price-value text-2xl font-bold mt-1" :style="{ color: 'var(--text)' }">{{ fmtUSD(r.receivedUSD) }}</p>
            <div class="mt-2 space-y-1 text-xs">
              <div class="flex justify-between" :style="{ color: 'var(--text-3)' }">
                <span>Tipo de cambio real:</span>
                <span class="font-mono font-semibold">{{ fmt(r.effectiveRate) }}</span>
              </div>
              <div class="flex justify-between" :style="{ color: 'var(--red)' }">
                <span>Costo comisión:</span>
                <span class="font-mono">{{ fmt(r.commissionImpact) }}</span>
              </div>
              <div class="flex justify-between" :style="{ color: 'var(--text-3)' }">
                <span>Spread:</span>
                <span>{{ r.spreadPct.toFixed(3) }}%</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- ─── PLAZO FIJO ─── -->
    <div v-if="activeTab === 'plazofijo'" class="space-y-6">
      <div class="card p-6">
        <h2 class="font-semibold mb-1" :style="{ color: 'var(--text)' }">Plazo fijo</h2>
        <p class="text-xs mb-6" :style="{ color: 'var(--text-3)' }">Calculá el rendimiento de un plazo fijo en pesos</p>

        <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <div>
            <label class="block text-xs font-medium mb-1.5" :style="{ color: 'var(--text-2)' }">Capital inicial</label>
            <div class="relative">
              <span class="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm" :style="{ color: 'var(--text-3)' }">$</span>
              <input v-model.number="pf.capital" type="number" class="input-field pl-7" min="1000" />
            </div>
          </div>
          <div>
            <label class="block text-xs font-medium mb-1.5" :style="{ color: 'var(--text-2)' }">TNA (%)</label>
            <div class="relative">
              <input v-model.number="pf.tna" type="number" class="input-field pr-7" step="0.1" />
              <span class="absolute right-3.5 top-1/2 -translate-y-1/2 text-sm" :style="{ color: 'var(--text-3)' }">%</span>
            </div>
          </div>
          <div>
            <label class="block text-xs font-medium mb-1.5" :style="{ color: 'var(--text-2)' }">Días</label>
            <div class="flex gap-2">
              <input v-model.number="pf.dias" type="number" class="input-field" min="1" max="365" />
              <div class="flex gap-1 flex-shrink-0">
                <button v-for="d in [30,60,90,180]" :key="d" @click="pf.dias = d"
                  class="px-2.5 py-1 rounded-lg text-xs font-medium border transition-colors"
                  :style="pf.dias === d
                    ? { background: 'var(--brand)', color: '#fff', borderColor: 'var(--brand)' }
                    : { borderColor: 'var(--border)', color: 'var(--text-2)' }">
                  {{ d }}
                </button>
              </div>
            </div>
          </div>
        </div>

        <div v-if="pfResult" class="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div class="rounded-xl border p-4 text-center" :style="{ background: 'var(--brand-bg)', borderColor: 'rgba(14,164,122,.25)' }">
            <p class="text-xs uppercase tracking-wide mb-1" :style="{ color: 'var(--brand)' }">Total al vencer</p>
            <p class="price-value text-2xl font-bold" :style="{ color: 'var(--brand)' }">{{ fmt(pfResult.total) }}</p>
          </div>
          <div class="rounded-xl border p-4 text-center" :style="{ background: 'var(--green-bg)', borderColor: 'rgba(52,211,153,.25)' }">
            <p class="text-xs uppercase tracking-wide mb-1" :style="{ color: 'var(--green)' }">Intereses ganados</p>
            <p class="price-value text-2xl font-bold" :style="{ color: 'var(--green)' }">{{ fmt(pfResult.intereses) }}</p>
          </div>
          <div class="rounded-xl border p-4 text-center" :style="{ background: 'var(--surface-2)', borderColor: 'var(--border)' }">
            <p class="text-xs uppercase tracking-wide mb-1" :style="{ color: 'var(--text-3)' }">TEA</p>
            <p class="price-value text-2xl font-bold" :style="{ color: 'var(--text)' }">{{ pfResult.tea.toFixed(2) }}%</p>
          </div>
          <div class="rounded-xl border p-4 text-center" :style="{ background: 'var(--surface-2)', borderColor: 'var(--border)' }">
            <p class="text-xs uppercase tracking-wide mb-1" :style="{ color: 'var(--text-3)' }">Rendimiento período</p>
            <p class="price-value text-2xl font-bold" :style="{ color: 'var(--text)' }">{{ pfResult.rendPeriodo.toFixed(3) }}%</p>
          </div>
        </div>

        <div class="mt-5 p-4 rounded-xl border text-xs" :style="{ background: 'var(--surface-2)', borderColor: 'var(--border)', color: 'var(--text-3)' }">
          <strong :style="{ color: 'var(--text-2)' }">Fórmula:</strong>
          Intereses = Capital × TNA/100 × Días/365 · Total = Capital + Intereses
          <br/>TEA = (1 + TNA/100 × Días/365)^(365/Días) − 1
        </div>
      </div>
    </div>

    <!-- ─── LECAP ─── -->
    <div v-if="activeTab === 'lecap'" class="space-y-6">
      <div class="card p-6">
        <h2 class="font-semibold mb-1" :style="{ color: 'var(--text)' }">LECAP — Letras de Capitalización</h2>
        <p class="text-xs mb-2" :style="{ color: 'var(--text-3)' }">
          Las LECAP son letras del Tesoro Nacional que se emiten con descuento y capitalizan a una tasa fija.
          Se operan en el mercado secundario a precio de mercado.
        </p>

        <div class="p-3 rounded-xl border text-xs mb-6" :style="{ background: 'var(--amber-bg)', borderColor: 'rgba(180,83,9,.25)', color: 'var(--amber)' }">
          <strong>¿Cómo funcionan?</strong> Comprás la letra a un precio inferior a su valor nominal ($1.000).
          Al vencimiento recibís el VN completo. La diferencia es tu ganancia.
          También podés comprarlas en el mercado secundario a precio de mercado.
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          <div>
            <label class="block text-xs font-medium mb-1.5" :style="{ color: 'var(--text-2)' }">Monto a invertir (ARS)</label>
            <div class="relative">
              <span class="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm" :style="{ color: 'var(--text-3)' }">$</span>
              <input v-model.number="lecap.monto" type="number" class="input-field pl-7" />
            </div>
          </div>
          <div>
            <label class="block text-xs font-medium mb-1.5" :style="{ color: 'var(--text-2)' }">Precio de compra (% del VN)</label>
            <div class="relative">
              <input v-model.number="lecap.precio" type="number" class="input-field pr-7" step="0.01" placeholder="ej. 95.5" />
              <span class="absolute right-3.5 top-1/2 -translate-y-1/2 text-sm" :style="{ color: 'var(--text-3)' }">%</span>
            </div>
            <p class="text-[10px] mt-1" :style="{ color: 'var(--text-3)' }">100% = par · menor precio = mayor rendimiento</p>
          </div>
          <div>
            <label class="block text-xs font-medium mb-1.5" :style="{ color: 'var(--text-2)' }">Días al vencimiento</label>
            <input v-model.number="lecap.dias" type="number" class="input-field" min="1" placeholder="ej. 90" />
          </div>
        </div>

        <div v-if="lecapResult" class="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div class="rounded-xl border p-4 text-center" :style="{ background: 'var(--brand-bg)', borderColor: 'rgba(14,164,122,.25)' }">
            <p class="text-xs uppercase tracking-wide mb-1" :style="{ color: 'var(--brand)' }">Valor nominal obtenido</p>
            <p class="price-value text-2xl font-bold" :style="{ color: 'var(--brand)' }">{{ fmt(lecapResult.vnTotal) }}</p>
          </div>
          <div class="rounded-xl border p-4 text-center" :style="{ background: 'var(--green-bg)', borderColor: 'rgba(52,211,153,.25)' }">
            <p class="text-xs uppercase tracking-wide mb-1" :style="{ color: 'var(--green)' }">Ganancia</p>
            <p class="price-value text-2xl font-bold" :style="{ color: 'var(--green)' }">{{ fmt(lecapResult.ganancia) }}</p>
          </div>
          <div class="rounded-xl border p-4 text-center" :style="{ background: 'var(--surface-2)', borderColor: 'var(--border)' }">
            <p class="text-xs uppercase tracking-wide mb-1" :style="{ color: 'var(--text-3)' }">TIR anual (TNA)</p>
            <p class="price-value text-2xl font-bold" :style="{ color: 'var(--text)' }">{{ lecapResult.tirAnual.toFixed(2) }}%</p>
          </div>
          <div class="rounded-xl border p-4 text-center" :style="{ background: 'var(--surface-2)', borderColor: 'var(--border)' }">
            <p class="text-xs uppercase tracking-wide mb-1" :style="{ color: 'var(--text-3)' }">TEA</p>
            <p class="price-value text-2xl font-bold" :style="{ color: 'var(--text)' }">{{ lecapResult.tea.toFixed(2) }}%</p>
          </div>
        </div>
      </div>
    </div>

    <!-- ─── BONO ─── -->
    <div v-if="activeTab === 'bono'" class="space-y-6">
      <div class="card p-6">
        <h2 class="font-semibold mb-1" :style="{ color: 'var(--text)' }">Bono simple (cupón 0 o con amortización)</h2>
        <p class="text-xs mb-6" :style="{ color: 'var(--text-3)' }">Calculá el rendimiento actual y la TIR estimada de un bono</p>

        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          <div>
            <label class="block text-xs font-medium mb-1.5" :style="{ color: 'var(--text-2)' }">Precio de compra (% del VN)</label>
            <div class="relative">
              <input v-model.number="bono.precio" type="number" class="input-field pr-7" step="0.01" placeholder="ej. 45" />
              <span class="absolute right-3.5 top-1/2 -translate-y-1/2 text-sm" :style="{ color: 'var(--text-3)' }">%</span>
            </div>
          </div>
          <div>
            <label class="block text-xs font-medium mb-1.5" :style="{ color: 'var(--text-2)' }">Cupón anual (% del VN)</label>
            <div class="relative">
              <input v-model.number="bono.cupon" type="number" class="input-field pr-7" step="0.01" placeholder="ej. 8.75" />
              <span class="absolute right-3.5 top-1/2 -translate-y-1/2 text-sm" :style="{ color: 'var(--text-3)' }">%</span>
            </div>
          </div>
          <div>
            <label class="block text-xs font-medium mb-1.5" :style="{ color: 'var(--text-2)' }">Años al vencimiento</label>
            <input v-model.number="bono.anios" type="number" class="input-field" min="0.1" step="0.1" placeholder="ej. 5" />
          </div>
        </div>

        <div v-if="bonoResult" class="grid grid-cols-2 sm:grid-cols-3 gap-4">
          <div class="rounded-xl border p-4 text-center" :style="{ background: 'var(--brand-bg)', borderColor: 'rgba(14,164,122,.25)' }">
            <p class="text-xs uppercase tracking-wide mb-1" :style="{ color: 'var(--brand)' }">Rendimiento corriente</p>
            <p class="price-value text-2xl font-bold" :style="{ color: 'var(--brand)' }">{{ bonoResult.currentYield.toFixed(2) }}%</p>
            <p class="text-[10px] mt-1" :style="{ color: 'var(--text-3)' }">Cupón anual / Precio pagado</p>
          </div>
          <div class="rounded-xl border p-4 text-center" :style="{ background: 'var(--green-bg)', borderColor: 'rgba(52,211,153,.25)' }">
            <p class="text-xs uppercase tracking-wide mb-1" :style="{ color: 'var(--green)' }">TIR estimada (YTM)</p>
            <p class="price-value text-2xl font-bold" :style="{ color: 'var(--green)' }">{{ bonoResult.ytm.toFixed(2) }}%</p>
            <p class="text-[10px] mt-1" :style="{ color: 'var(--text-3)' }">Rendimiento al vencimiento</p>
          </div>
          <div class="rounded-xl border p-4 text-center" :style="{ background: 'var(--surface-2)', borderColor: 'var(--border)' }">
            <p class="text-xs uppercase tracking-wide mb-1" :style="{ color: 'var(--text-3)' }">Upside vs par</p>
            <p class="price-value text-2xl font-bold"
               :style="{ color: bonoResult.upside > 0 ? 'var(--green)' : 'var(--red)' }">
              {{ bonoResult.upside > 0 ? '+' : '' }}{{ bonoResult.upside.toFixed(2) }}%
            </p>
            <p class="text-[10px] mt-1" :style="{ color: 'var(--text-3)' }">Si vence al 100% del VN</p>
          </div>
        </div>

        <div class="mt-5 p-4 rounded-xl border text-xs space-y-1" :style="{ background: 'var(--surface-2)', borderColor: 'var(--border)', color: 'var(--text-3)' }">
          <p><strong :style="{ color: 'var(--text-2)' }">Rendimiento corriente</strong> = Cupón anual / Precio actual × 100</p>
          <p><strong :style="{ color: 'var(--text-2)' }">TIR (YTM)</strong> = Calculada via Newton-Raphson considerando flujos de fondos al vencimiento</p>
        </div>
      </div>
    </div>

    <!-- ─── INFLACIÓN ─── -->
    <div v-if="activeTab === 'inflacion'" class="space-y-6">
      <div class="card p-6">
        <h2 class="font-semibold mb-1" :style="{ color: 'var(--text)' }">Actualización por inflación</h2>
        <p class="text-xs mb-6" :style="{ color: 'var(--text-3)' }">¿Cuánto vale hoy ese dinero de antes? ¿Cuánto necesitás ganar para mantener el poder adquisitivo?</p>

        <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <div>
            <label class="block text-xs font-medium mb-1.5" :style="{ color: 'var(--text-2)' }">Capital original</label>
            <div class="relative">
              <span class="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm" :style="{ color: 'var(--text-3)' }">$</span>
              <input v-model.number="inf.capital" type="number" class="input-field pl-7" />
            </div>
          </div>
          <div>
            <label class="block text-xs font-medium mb-1.5" :style="{ color: 'var(--text-2)' }">Inflación del período (%)</label>
            <div class="relative">
              <input v-model.number="inf.inflacion" type="number" class="input-field pr-7" step="0.1" placeholder="ej. 211" />
              <span class="absolute right-3.5 top-1/2 -translate-y-1/2 text-sm" :style="{ color: 'var(--text-3)' }">%</span>
            </div>
          </div>
          <div>
            <label class="block text-xs font-medium mb-1.5" :style="{ color: 'var(--text-2)' }">Rendimiento obtenido (%)</label>
            <div class="relative">
              <input v-model.number="inf.rendimiento" type="number" class="input-field pr-7" step="0.1" placeholder="ej. 190" />
              <span class="absolute right-3.5 top-1/2 -translate-y-1/2 text-sm" :style="{ color: 'var(--text-3)' }">%</span>
            </div>
          </div>
        </div>

        <div v-if="infResult" class="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div class="rounded-xl border p-4 text-center" :style="{ background: 'var(--surface-2)', borderColor: 'var(--border)' }">
            <p class="text-xs uppercase tracking-wide mb-1" :style="{ color: 'var(--text-3)' }">Valor actualizado</p>
            <p class="price-value text-xl font-bold" :style="{ color: 'var(--text)' }">{{ fmt(infResult.valorActualizado) }}</p>
            <p class="text-[10px] mt-1" :style="{ color: 'var(--text-3)' }">Para mantener poder adquisitivo</p>
          </div>
          <div class="rounded-xl border p-4 text-center" :style="{ background: 'var(--surface-2)', borderColor: 'var(--border)' }">
            <p class="text-xs uppercase tracking-wide mb-1" :style="{ color: 'var(--text-3)' }">Capital final</p>
            <p class="price-value text-xl font-bold" :style="{ color: 'var(--text)' }">{{ fmt(infResult.capitalFinal) }}</p>
            <p class="text-[10px] mt-1" :style="{ color: 'var(--text-3)' }">Con tu rendimiento aplicado</p>
          </div>
          <div
            class="rounded-xl border p-4 text-center"
            :style="infResult.rendimientoReal >= 0
              ? { background: 'var(--green-bg)', borderColor: 'rgba(52,211,153,.25)' }
              : { background: 'var(--red-bg)', borderColor: 'rgba(220,38,38,.25)' }"
          >
            <p class="text-xs uppercase tracking-wide mb-1"
              :style="{ color: infResult.rendimientoReal >= 0 ? 'var(--green)' : 'var(--red)' }">
              Rendimiento real
            </p>
            <p class="price-value text-xl font-bold"
              :style="{ color: infResult.rendimientoReal >= 0 ? 'var(--green)' : 'var(--red)' }">
              {{ infResult.rendimientoReal >= 0 ? '+' : '' }}{{ infResult.rendimientoReal.toFixed(2) }}%
            </p>
            <p class="text-[10px] mt-1"
              :style="{ color: infResult.rendimientoReal >= 0 ? 'var(--green)' : 'var(--red)' }">
              {{ infResult.rendimientoReal >= 0 ? '✓ Ganaste contra la inflación' : '✗ Perdiste poder adquisitivo' }}
            </p>
          </div>
          <div class="rounded-xl border p-4 text-center" :style="{ background: 'var(--surface-2)', borderColor: 'var(--border)' }">
            <p class="text-xs uppercase tracking-wide mb-1" :style="{ color: 'var(--text-3)' }">Ganancia/pérdida real</p>
            <p class="price-value text-xl font-bold"
              :style="{ color: infResult.diferenciaReal >= 0 ? 'var(--green)' : 'var(--red)' }">
              {{ fmt(infResult.diferenciaReal) }}
            </p>
          </div>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, nextTick } from 'vue'
import dayjs from 'dayjs'
import 'dayjs/locale/es'
import { 
  CalendarIcon, 
  ChevronLeftIcon, 
  ChevronRightIcon,
  ChevronsLeftIcon,
  ChevronsRightIcon
} from 'lucide-vue-next'
import { useDolarStore } from '@/stores/dolar.js'
import { useBrokersStore } from '@/stores/brokers.js'
import { useBreakpoints, breakpointsTailwind, onClickOutside } from '@vueuse/core'

dayjs.locale('es')

const dolarStore   = useDolarStore()
const brokersStore = useBrokersStore()

const breakpoints = useBreakpoints(breakpointsTailwind)
const isMobile = breakpoints.smaller('sm')

const tabs = [
  { id: 'alquiler',    label: 'Alquiler' },
  { id: 'mep',         label: 'Dólar MEP' },
  { id: 'plazofijo',   label: 'Plazo Fijo' },
  { id: 'lecap',       label: 'LECAP' },
  { id: 'bono',        label: 'Bono' },
  { id: 'inflacion',   label: 'Inflación' },
]
const activeTab = ref('alquiler')

// ── CUSTOM DATE PICKER LOGIC ──────────────────────
const showDatePicker = ref(false)
const pickerMode = ref('days') // 'days' | 'years'
const datePickerRef = ref(null)
const datePickerContentRef = ref(null)
const pickerYear = ref(dayjs().year())
const pickerMonth = ref(dayjs().month())
const pickerYearGridStart = ref(dayjs().year() - 5)

onClickOutside(datePickerContentRef, () => { 
  if (showDatePicker.value) {
    showDatePicker.value = false 
    pickerMode.value = 'days'
  }
})

const datePickerDesktopStyle = computed(() => {
  if (!datePickerRef.value || isMobile.value) return {}
  const rect = datePickerRef.value.getBoundingClientRect()
  return {
    position: 'fixed',
    top: `${rect.bottom + 12}px`,
    left: `${rect.left}px`,
  }
})

const yearsGrid = computed(() => {
  const years = []
  for (let i = 0; i < 12; i++) years.push(pickerYearGridStart.value + i)
  return years
})

const changeMonth = (delta) => {
  let m = pickerMonth.value + delta
  if (m < 0) { m = 11; pickerYear.value-- }
  else if (m > 11) { m = 0; pickerYear.value++ }
  pickerMonth.value = m
}

const changeYear = (delta) => {
  pickerYear.value += delta
}

const changeYearDecade = (delta) => {
  pickerYearGridStart.value += delta * 12
}

const selectYear = (y) => {
  pickerYear.value = y
  pickerMode.value = 'days'
}

const yearsRange = computed(() => {
  const current = dayjs().year()
  const years = []
  for (let i = current - 10; i <= current + 1; i++) years.push(i)
  return years
})

const pickerDays = computed(() => {
  const date = dayjs(`${pickerYear.value}-${pickerMonth.value + 1}-01`)
  return date.daysInMonth()
})

const pickerOffset = computed(() => {
  const date = dayjs(`${pickerYear.value}-${pickerMonth.value + 1}-01`)
  return date.day() // 0 is Sunday
})

const selectDay = (day) => {
  const d = dayjs(`${pickerYear.value}-${pickerMonth.value + 1}-${day}`)
  alq.value.fechaInicio = d.format('YYYY-MM-DD')
  showDatePicker.value = false
}

const isPickerSelected = (day) => {
  if (!alq.value.fechaInicio) return false
  const d = dayjs(alq.value.fechaInicio)
  return d.year() === pickerYear.value && d.month() === pickerMonth.value && d.date() === day
}

// ── ALQUILER (CON PROXIES REAL-TIME Y LÓGICA ESCALONADA) ──
const alq = ref({
  monto: 350000,
  fechaInicio: dayjs().subtract(6, 'month').startOf('month').format('YYYY-MM-DD'),
  frecuencia: 6,
  indice: 'icl',
})

const iclData = ref({})
const ipcData = ref({})
const loadingIndices = ref(false)
const calculatedResult = ref(null)

onMounted(async () => {
  loadingIndices.value = true
  try {
    const [iclRes, ipcRes] = await Promise.all([
      fetch('/api/icl'),
      fetch('/api/ipc')
    ])
    
    if (iclRes.ok) iclData.value = await iclRes.json()
    if (ipcRes.ok) ipcData.value = await ipcRes.json()
  } catch (e) {
    console.error('Error loading indices:', e)
  } finally {
    loadingIndices.value = false
  }
})

const calculateRentTable = ref([])

const calculateRent = () => {
  const { monto, fechaInicio, frecuencia, indice } = alq.value
  if (!monto || !fechaInicio || !frecuencia) return

  const start = dayjs(fechaInicio).startOf('month')
  const now = dayjs().add(1, 'month').endOf('month') // Projection until next month
  
  let currentRent = monto
  let lastAdjustDate = start
  let nextAdjustDate = start.add(frecuencia, 'month')
  
  const periods = []
  let iterDate = start

  // Generate month by month data
  while (iterDate.isBefore(now)) {
    const isAdjustmentMonth = iterDate.isSame(nextAdjustDate, 'month')
    let adjustmentPct = 0

    if (isAdjustmentMonth) {
      let multiplier = 1
      if (indice === 'icl') {
        const valStart = iclData.value[lastAdjustDate.format('01-MM-YYYY')] || iclData.value[lastAdjustDate.format('DD-MM-YYYY')]
        const valEnd = iclData.value[nextAdjustDate.format('01-MM-YYYY')] || iclData.value[nextAdjustDate.format('DD-MM-YYYY')]
        if (valStart && valEnd) multiplier = valEnd / valStart
      } else {
        const valStart = ipcData.value.find(i => i.fecha.startsWith(lastAdjustDate.format('YYYY-MM')))?.valor
        const valEnd = ipcData.value.find(i => i.fecha.startsWith(nextAdjustDate.format('YYYY-MM')))?.valor
        if (valStart !== undefined && valEnd !== undefined) multiplier = valEnd / valStart
      }
      
      const previousRent = currentRent
      currentRent = currentRent * multiplier
      adjustmentPct = ((currentRent / previousRent) - 1) * 100
      
      lastAdjustDate = nextAdjustDate
      nextAdjustDate = nextAdjustDate.add(frecuencia, 'month')
    }

    // Indices for this specific month (for display in table)
    let ipcMes = 0
    if (indice === 'ipc') {
        ipcMes = ipcData.value.find(i => i.fecha.startsWith(iterDate.format('YYYY-MM')))?.valor || 0
    }

    periods.push({
      fecha: iterDate.format('MMM YYYY'),
      rent: currentRent,
      adjustment: adjustmentPct,
      isAdjustmentMonth,
      isStart: iterDate.isSame(start, 'month')
    })

    iterDate = iterDate.add(1, 'month')
    if (periods.length > 48) break // Safety
  }

  calculateRentTable.value = periods
  const lastPeriod = periods[periods.length - 1]

  calculatedResult.value = {
    nuevoMonto: currentRent,
    variacion: ((currentRent / monto) - 1) * 100,
    diferencia: currentRent - monto,
    nextDate: nextAdjustDate.format('DD/MM/YYYY'),
    totalAumento: ((currentRent - monto) / monto) * 100,
    difMensual: currentRent - monto,
    proxAjustes: Math.ceil(dayjs().diff(start, 'month') / frecuencia)
  }

  nextTick(() => {
    document.getElementById('rental-result')?.scrollIntoView({ behavior: 'smooth', block: 'center' })
  })
}

// ── MEP ──────────────────────────────────────────
const mep = ref({ amount: 100000, marketRate: null })
const marketRateAuto = computed(() => dolarStore.mepRate?.venta || null)
const effectiveMarketRate = computed(() => mep.value.marketRate || marketRateAuto.value)

const mepBrokerResults = computed(() => {
  if (!effectiveMarketRate.value || !mep.value.amount) return []
  return brokersStore.compareAll(effectiveMarketRate.value, mep.value.amount)
})

// ── PLAZO FIJO ────────────────────────────────────
const pf = ref({ capital: 100000, tna: 37, dias: 30 })
const pfResult = computed(() => {
  const { capital, tna, dias } = pf.value
  if (!capital || !tna || !dias) return null
  const r       = (tna / 100) * (dias / 365)
  const intereses = capital * r
  const total     = capital + intereses
  const tea       = (Math.pow(1 + r, 365 / dias) - 1) * 100
  return {
    total, intereses, tea,
    rendPeriodo: r * 100,
  }
})

// ── LECAP ─────────────────────────────────────────
const lecap = ref({ monto: 100000, precio: 95, dias: 90 })
const lecapResult = computed(() => {
  const { monto, precio, dias } = lecap.value
  if (!monto || !precio || !dias) return null
  const precioUnitario = (precio / 100) * 1000
  const laminas        = monto / precioUnitario
  const vnTotal        = laminas * 1000
  const ganancia       = vnTotal - monto

  const tirAnual = ((1000 / precioUnitario - 1) * (365 / dias)) * 100
  const rendPeriodo = (1000 / precioUnitario - 1)
  const tea         = (Math.pow(1 + rendPeriodo, 365 / dias) - 1) * 100

  return { vnTotal, ganancia, tirAnual, tea }
})

// ── BONO ──────────────────────────────────────────
const bono = ref({ precio: 45, cupon: 8.75, anios: 5 })
const bonoResult = computed(() => {
  const { precio, cupon, anios } = bono.value
  if (!precio || anios <= 0) return null

  const p = precio / 100
  const c = cupon  / 100

  const currentYield = (c / p) * 100
  const upside = ((1 - p) / p) * 100

  let y  = c / p
  for (let iter = 0; iter < 100; iter++) {
    let pv  = 0
    let dpv = 0
    for (let t = 1; t <= anios; t++) {
      pv  +=  c / Math.pow(1 + y, t)
      dpv += -t * c / Math.pow(1 + y, t + 1)
    }
    pv  += 1 / Math.pow(1 + y, anios)
    dpv += -anios / Math.pow(1 + y, anios + 1)
    const f   = pv - p
    if (Math.abs(f) < 1e-8) break
    y = y - f / dpv
  }
  const ytm = y * 100

  return { currentYield, ytm, upside }
})

// ── INFLACIÓN ─────────────────────────────────────
const inf = ref({ capital: 100000, inflacion: 211, rendimiento: 190 })
const infResult = computed(() => {
  const { capital, inflacion, rendimiento } = inf.value
  if (!capital || inflacion === null) return null

  const valorActualizado = capital * (1 + inflacion / 100)
  const capitalFinal     = capital * (1 + rendimiento / 100)
  const rendimientoReal = ((1 + rendimiento / 100) / (1 + inflacion / 100) - 1) * 100
  const diferenciaReal  = capitalFinal - valorActualizado

  return { valorActualizado, capitalFinal, rendimientoReal, diferenciaReal }
})

const fmt    = n => n !== undefined ? new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(n) : '—'
const fmtUSD = n => new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'USD', minimumFractionDigits: 2 }).format(n)
</script>

<style scoped>
/* Hide spin buttons in number inputs */
input::-webkit-outer-spin-button,
input::-webkit-inner-spin-button {
  appearance: none;
  -webkit-appearance: none;
  margin: 0;
}
input[type=number] {
  appearance: textfield;
  -moz-appearance: textfield;
}

.capitalize {
  text-transform: capitalize;
}
</style>
