<template>
  <div class="min-h-screen py-12 px-4 sm:px-6 lg:px-12 transition-colors duration-500" style="background-color: var(--bg); color: var(--text);">
    <div class="max-w-6xl mx-auto">
      <!-- Header -->
      <header class="mb-12 text-center sm:text-left">
        <h1 class="text-5xl font-black mb-4 tracking-tighter bg-gradient-to-r from-emerald-400 to-emerald-600 bg-clip-text text-transparent text-shadow-glow">Créditos Hipotecarios</h1>
        <p class="text-lg opacity-80" style="color: var(--text-2);">Tu primera casa, comparada de forma inteligente y sin complicaciones.</p>
      </header>

      <!-- Sueldo Toggle Section -->
      <div class="glass-container mb-12 p-8 rounded-[2.5rem] border border-white/5 flex flex-col md:flex-row items-center justify-between gap-6 overflow-hidden relative shadow-2xl">
        <div class="absolute inset-0 bg-emerald-500/5 pointer-events-none"></div>
        <div class="flex items-center gap-6 relative z-10">
          <div class="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl shadow-lg border border-white/10" style="background-color: var(--surface); color: var(--brand);">💼</div>
          <div class="text-center md:text-left">
            <h2 class="text-lg font-bold">¿Acreditás sueldo en el banco?</h2>
            <p class="text-xs opacity-60" style="color: var(--text-3);">Mostramos tasas preferenciales exclusivas para clientes.</p>
          </div>
        </div>
        <div class="flex items-center gap-4 relative z-10">
          <span class="text-xs font-bold uppercase tracking-widest transition-colors" :style="{ color: !store.showSalaryRates ? 'var(--brand)' : 'var(--text-3)' }">Base</span>
          <button 
            @click="store.showSalaryRates = !store.showSalaryRates"
            class="relative inline-flex h-9 w-16 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-300 focus:outline-none shadow-inner"
            :style="{ backgroundColor: store.showSalaryRates ? 'var(--brand)' : 'var(--border-2)' }"
          >
            <span 
              class="pointer-events-none inline-block h-7 w-7 transform rounded-full bg-white shadow-xl ring-0 transition duration-500 ease-in-out mt-[2px] ml-[2px]"
              :class="store.showSalaryRates ? 'translate-x-7' : 'translate-x-0'"
            ></span>
          </button>
          <span class="text-xs font-bold uppercase tracking-widest transition-colors" :style="{ color: store.showSalaryRates ? 'var(--brand)' : 'var(--text-3)' }">Sueldo</span>
        </div>
      </div>

      <!-- Enhanced Filter Bar -->
      <div v-if="!store.loading && store.rates.length > 0" class="glass-container mb-8 p-6 rounded-[2.5rem] border border-white/5 shadow-xl animate-fade-in">
        <div class="flex flex-col lg:flex-row items-center gap-6">
          <div class="flex-1 w-full">
            <label class="text-[10px] font-black uppercase tracking-widest mb-2 block opacity-50">Ordenar por</label>
            <div class="flex p-1 bg-black/5 dark:bg-white/5 rounded-2xl border border-black/5 dark:border-white/5">
              <button 
                v-for="opt in [{id:'tna', label:'Tasa'}, {id:'financing', label:'Financiación'}, {id:'term', label:'Plazo'}]"
                :key="opt.id"
                @click="store.sortBy = opt.id"
                class="flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all"
                :class="store.sortBy === opt.id ? 'bg-white dark:bg-emerald-500 shadow-md text-emerald-600 dark:text-white' : 'opacity-60 hover:opacity-100'"
              >
                {{ opt.label }}
              </button>
            </div>
          </div>
          <div class="w-full lg:w-48">
            <label class="text-[10px] font-black uppercase tracking-widest mb-2 block opacity-50">Tasa máx (%)</label>
            <input v-model.number="store.filters.maxTna" type="number" step="0.5" placeholder="Ej: 5.5" class="w-full bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/5 rounded-2xl px-4 py-2.5 text-sm font-bold focus:ring-2 focus:ring-emerald-500/30 outline-none transition-all" />
          </div>
          <div class="w-full lg:w-48">
            <label class="text-[10px] font-black uppercase tracking-widest mb-2 block opacity-50">Mín Financia (%)</label>
            <input v-model.number="store.filters.minFinancing" type="number" placeholder="Ej: 75" class="w-full bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/5 rounded-2xl px-4 py-2.5 text-sm font-bold focus:ring-2 focus:ring-emerald-500/30 outline-none transition-all" />
          </div>
          <button @click="resetFilters" class="lg:mt-6 p-2.5 rounded-2xl bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 transition-colors" title="Limpiar filtros">
            <RefreshCcw :size="16" class="opacity-60" />
          </button>
        </div>
      </div>

      <!-- Loading State -->
      <div v-if="store.loading" class="flex flex-col items-center justify-center py-32 opacity-50 text-center animate-pulse">
        <div class="relative w-16 h-16 mb-6 mx-auto">
          <div class="absolute inset-0 border-4 border-emerald-500/20 rounded-full"></div>
          <div class="absolute inset-0 border-4 border-emerald-500 rounded-full border-t-transparent animate-spin"></div>
        </div>
        <p class="text-sm font-black tracking-widest uppercase" style="color: var(--text-2);">Sincronizando BCRA...</p>
      </div>

      <!-- No Results -->
      <div v-else-if="store.filteredRates.length === 0" class="text-center py-20 px-8 glass-container rounded-[2.5rem] border border-white/5 animate-fade-in">
        <div class="text-5xl mb-6">🔍</div>
        <h3 class="text-xl font-black mb-2">No encontramos nada con esos filtros</h3>
        <p class="text-sm opacity-60 mb-8 max-w-xs mx-auto text-center">Probá ajustando la tasa máxima o la financiación mínima para ver más opciones.</p>
        <button @click="resetFilters" class="text-emerald-500 font-black uppercase tracking-widest text-xs border-b-2 border-emerald-500/30 pb-1 hover:border-emerald-500 transition-all">Restablecer filtros</button>
      </div>

      <!-- Mortgage List -->
      <div v-else class="space-y-6 mb-16 animate-fade-in">
        <div 
          v-for="bank in store.paginatedRates" 
          :key="bank.id"
          class="premium-card group transition-all duration-300 hover:scale-[1.01] hover:shadow-2xl"
        >
          <div class="p-6 md:p-8 flex flex-col md:flex-row items-center gap-8">
            <div class="flex-shrink-0 w-24 h-24 bg-white rounded-[2rem] flex items-center justify-center p-5 shadow-2xl border border-black/5 relative overflow-hidden group-hover:scale-110 transition-transform duration-500">
               <div class="absolute inset-0 bg-gradient-to-br from-white to-slate-50"></div>
               <img v-if="bank.logo" :src="getLogoUrl(bank.logo)" :alt="bank.bankName" class="max-w-full max-h-full object-contain relative z-10" @error="handleImageError" />
               <Building v-else class="relative z-10" style="color: var(--text-3);" :size="32" />
            </div>

            <div class="flex-1 text-center md:text-left min-w-0">
              <div class="flex flex-col md:flex-row items-center gap-3 mb-2">
                <h3 class="text-2xl font-black truncate leading-tight tracking-tight">{{ bank.bankName }}</h3>
                <div class="flex gap-2">
                  <span v-if="bank.isSalaryAccount" class="text-[9px] border px-2 py-0.5 rounded-full font-black uppercase tracking-tighter" style="border-color: var(--brand); color: var(--brand);">SUELDO</span>
                </div>
              </div>
              <div class="flex flex-wrap justify-center md:justify-start gap-3 mt-4">
                <div class="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/5 shadow-sm">
                  <Calendar :size="12" style="color: var(--brand);" />
                  <span class="text-[11px] font-bold uppercase tracking-tight" style="color: var(--text-2);">Hasta {{ bank.term }}</span>
                </div>
                <div class="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/5 shadow-sm">
                  <Coins :size="12" style="color: var(--brand);" />
                  <span class="text-[11px] font-bold uppercase tracking-tight" style="color: var(--text-2);">Financia {{ bank.financing }}</span>
                </div>
              </div>
            </div>
            
            <div class="flex flex-col items-center md:items-end flex-shrink-0 pt-4 md:pt-0 border-t md:border-t-0 md:border-l w-full md:w-auto md:pl-8 text-center md:text-right" style="border-color: var(--border);">
              <div class="text-[11px] font-black uppercase tracking-[0.25em] mb-2 opacity-50" style="color: var(--text-3);">Lo que pagás extra</div>
              <div class="flex items-baseline gap-2">
                <span class="price-value text-5xl font-black leading-none tracking-tighter text-emerald-500">{{ (bank.tna || 0).toFixed(1) }}%</span>
                <span class="text-md font-bold uppercase opacity-60" style="color: var(--text-2);">+ UVA</span>
              </div>
              <p class="text-[10px] font-bold mt-3 opacity-40 uppercase tracking-widest">Tasa Nominal Anual</p>
            </div>
          </div>
        </div>

        <div v-if="store.hasMore" class="flex justify-center pt-8">
          <button @click="store.loadMore" class="px-12 py-4 rounded-3xl font-black text-sm uppercase tracking-[0.2em] transition-all duration-300 hover:scale-[1.03] active:scale-95 shadow-2xl glass-button overflow-hidden group relative" style="background-color: var(--surface); border: 1px solid var(--border); color: var(--text);">
            <span class="relative z-10 flex items-center gap-2">Explorar más bancos <ChevronDown class="group-hover:translate-y-1 transition-transform" /></span>
            <div class="absolute inset-0 bg-white/5 scale-x-0 group-hover:scale-x-100 transition-transform origin-left"></div>
          </button>
        </div>
      </div>

      <!-- Ranking Chart -->
      <section v-if="!store.loading && store.filteredRates.length > 0" class="mt-32">
        <div class="text-center mb-16">
          <h2 class="text-4xl font-black tracking-tight mb-4">Comparativa de Costos</h2>
          <p class="text-lg opacity-70 max-w-2xl mx-auto" style="color: var(--text-2);">Visualizá la diferencia de tasas entre las mejores ofertas disponibles hoy.</p>
        </div>
        <div class="glass-container p-8 md:p-12 rounded-[3.5rem] shadow-2xl border border-white/5 relative overflow-hidden">
          <div class="absolute top-0 right-0 p-12 opacity-[0.03] pointer-events-none transition-transform group-hover:rotate-12 duration-1000">
            <BarChart3 :size="240" />
          </div>
          <div class="space-y-10 relative z-10">
            <div v-for="bank in store.filteredRates.slice(0, 8)" :key="'chart-'+bank.id" class="group/bar flex items-center gap-8">
              <div class="w-12 h-12 bg-white rounded-2xl p-2 flex flex-shrink-0 items-center justify-center border shadow-xl group-hover:scale-110 transition-transform duration-300">
                <img v-if="bank.logo" :src="getLogoUrl(bank.logo)" class="max-w-full max-h-full object-contain" />
                <Building v-else style="color: var(--text-3);" :size="20" />
              </div>
              <div class="flex-1 min-w-0">
                <div class="flex justify-between items-end mb-3">
                  <span class="text-base font-black tracking-tight truncate">{{ bank.bankName }}</span>
                  <div class="flex items-baseline gap-1 flex-shrink-0 pl-4">
                    <span class="price-value text-lg font-black text-emerald-500">{{ (bank.tna || 0).toFixed(1) }}%</span>
                    <span class="text-[10px] font-bold opacity-50 uppercase">TNA</span>
                  </div>
                </div>
                <div class="h-3.5 rounded-full bg-black/10 dark:bg-white/5 border border-black/5 dark:border-white/10 p-[2px] overflow-hidden shadow-inner">
                  <div class="h-full rounded-full transition-all duration-[1.5s] ease-out-expo shadow-glow-emerald" style="background-color: var(--brand);" :style="{ width: `${(bank.tna / maxTna) * 100}%` }"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- SIMULADOR PREMIUM -->
      <section id="calculadora" class="mt-40 mb-20 scroll-mt-20">
        <div class="text-center mb-20">
          <div class="inline-flex items-center gap-2 px-4 py-1.5 rounded-xl bg-emerald-500/10 text-emerald-500 text-[10px] font-black uppercase tracking-[0.3em] mb-6">
            <Calculator :size="12" /> Simulador de préstamo
          </div>
          <h2 class="text-5xl font-black mb-6 tracking-tighter">Armá tu plan hipotecario</h2>
          <p class="text-lg opacity-60 max-w-2xl mx-auto">Calculá tu cuota mensual estimada basándote en las condiciones actuales y el valor de tu propiedad.</p>
        </div>

        <div class="glass-container p-6 md:p-12 lg:p-24 rounded-[2.5rem] md:rounded-[4rem] lg:rounded-[5rem] shadow-4xl border border-white/5 relative overflow-hidden group">
          <div class="absolute inset-0 bg-emerald-500/[0.01] transition-colors duration-1000 pointer-events-none"></div>

          <div class="relative z-10 space-y-16 md:space-y-32">
            
            <!-- STEP 1: SELECTOR DE BANCO (SEARCHABLE DROPDOWN) -->
            <div class="space-y-12">
              <div class="space-y-3">
                <label class="text-[11px] font-black uppercase tracking-[0.5em] text-emerald-500 mb-6 block">Paso 1: Entidad Financiera</label>
                <h3 class="text-3xl md:text-5xl font-black tracking-tighter italic">Seleccioná tu banco</h3>
              </div>

              <div class="relative">
                 <!-- Trigger Card -->
                 <button
                   @click="calc.showBankSelector = !calc.showBankSelector"
                   class="w-full flex flex-col md:flex-row items-center justify-between p-6 md:p-10 rounded-[2rem] md:rounded-[3.5rem] border-4 transition-all relative overflow-hidden group/bank-trigger"
                   :class="calc.showBankSelector ? 'border-emerald-500 bg-emerald-500/10 shadow-3xl' : 'border-white/5 bg-white/5 hover:border-emerald-500/40'"
                 >
                   <div class="flex items-center gap-10">
                      <div class="w-24 h-24 rounded-[2.5rem] bg-white flex items-center justify-center p-4 shadow-2xl transform transition-transform group-hover/bank-trigger:rotate-3">
                        <img v-if="selectedBank?.logo" :src="getLogoUrl(selectedBank.logo)" class="max-w-full max-h-full object-contain" />
                        <Building v-else class="text-slate-400" :size="32" />
                      </div>
                      <div class="text-left py-2">
                         <h4 class="text-3xl font-black tracking-tighter italic mb-2">{{ selectedBank?.bankName }}</h4>
                         <div class="flex items-center gap-6">
                            <span class="text-emerald-500 font-black text-lg">{{ selectedBank?.tna }}% <small class="text-[10px] opacity-60">+ UVA</small></span>
                            <span class="text-[11px] font-black opacity-30 uppercase tracking-widest">{{ selectedBank?.financing }} de Financiación</span>
                         </div>
                      </div>
                   </div>
                   <div class="flex items-center gap-6 mt-8 md:mt-0">
                      <div class="px-8 py-3 rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 text-[11px] font-black uppercase tracking-widest hidden sm:block">
                         Configuración Actual
                      </div>
                      <div class="w-16 h-16 rounded-full bg-emerald-500 flex items-center justify-center text-white shadow-glow-emerald">
                         <ChevronDown :size="32" :class="{ 'rotate-180': calc.showBankSelector }" class="transition-transform duration-500" />
                      </div>
                   </div>
                 </button>

                 <!-- Searchable Dropdown Overlay -->
                 <div v-if="calc.showBankSelector" class="absolute left-0 right-0 top-[110%] z-50 p-6 rounded-[3.5rem] border border-emerald-500/20 shadow-4xl animate-fade-in-up" style="background: var(--surface);">
                    <div class="space-y-6">
                        <div class="relative group">
                           <Search :size="20" class="absolute left-8 top-1/2 -translate-y-1/2 opacity-30 group-focus-within:opacity-100 transition-opacity" style="color: var(--text-1)" />
                           <input
                              v-model="calc.bankSearchQuery"
                              type="text"
                              placeholder="Buscar banco por nombre..."
                              class="w-full border-2 border-transparent focus:border-emerald-500 rounded-[2.5rem] pl-20 pr-10 py-6 font-black outline-none transition-all"
                              style="background: var(--bg-2); color: var(--text-1);"
                           />
                        </div>
                        <div class="max-h-[350px] overflow-y-auto custom-scrollbar pr-4 space-y-3">
                           <button
                             v-for="b in filteredBanks" :key="'bank-drop-'+b.id"
                             @click="calc.bankId = b.id; calc.showBankSelector = false"
                             class="w-full flex items-center justify-between p-6 rounded-[2.5rem] border-2 transition-all group/item"
                             :class="calc.bankId === b.id ? 'border-emerald-500 bg-emerald-500/10' : 'border-transparent hover:bg-emerald-500/5 hover:border-emerald-500/20'"
                           >
                             <div class="flex items-center gap-8">
                                <div class="w-16 h-16 rounded-2xl bg-white flex items-center justify-center p-3 shadow-xl flex-shrink-0">
                                   <img :src="getLogoUrl(b.logo)" class="max-w-full max-h-full object-contain" />
                                </div>
                                <div class="text-left">
                                   <p class="font-black text-xl italic tracking-tight mb-1" style="color: var(--text-1)">{{ b.bankName }}</p>
                                   <p class="text-[10px] font-black uppercase tracking-widest" style="color: var(--text-3)">{{ b.financing }} de financiación</p>
                                </div>
                             </div>
                             <div class="text-right flex flex-col items-end">
                                <p class="text-2xl font-black text-emerald-500">{{ b.tna }}%</p>
                                <p class="text-[9px] font-black uppercase tracking-widest" style="color: var(--text-3)">+ UVA</p>
                             </div>
                           </button>
                        </div>
                    </div>
                 </div>
              </div>
            </div>

            <!-- STEP 2: DETAILS (LINEAR) -->
            <div class="pt-12 md:pt-24 border-t border-white/5 space-y-12 md:space-y-20">
              <div class="space-y-3 mb-6 md:mb-10 text-center md:text-left">
                <label class="text-[11px] font-black uppercase tracking-[0.5em] text-emerald-500 mb-6 block">Paso 2: Simulación del Monto</label>
                <h3 class="text-3xl md:text-5xl font-black tracking-tighter italic">Definir capital y tiempo</h3>
              </div>

              <!-- Main Input with Visible Label -->
              <div class="space-y-16">
                 <div class="flex flex-col items-center gap-12">
                   <div class="w-full relative group/input">
                      <!-- Centralized Visible Label -->
                      <div class="absolute -top-10 left-1/2 -translate-x-1/2 px-10 py-2 bg-emerald-500 text-white rounded-full text-[12px] font-black uppercase tracking-[0.4em] z-20 shadow-xl shadow-emerald-500/20 transition-transform group-hover/input:scale-105">
                         Monto total del préstamo
                      </div>
                      
                      <span class="absolute left-6 md:left-10 top-1/2 -translate-y-1/2 text-emerald-500 font-black text-3xl md:text-5xl z-20 opacity-40">$</span>
                      <input
                        v-model.number="calc.amount"
                        type="number"
                        class="w-full bg-white dark:bg-white/5 border-4 border-emerald-500/20 hover:border-emerald-500/60 rounded-[2.5rem] md:rounded-[4rem] px-16 md:px-24 py-8 md:py-16 font-black outline-none focus:border-emerald-500 transition-all shadow-4xl price-value text-center"
                        style="font-size: clamp(1.8rem, 7vw, 5.5rem); letter-spacing: -2px;"
                        placeholder="Ej: 50.000.000"
                      />
                   </div>
                   
                   <button 
                     @click="calc.showUsdHelper = !calc.showUsdHelper"
                     class="px-14 py-8 rounded-[2.5rem] bg-emerald-500/10 border-2 border-emerald-500/20 hover:bg-emerald-500 hover:text-white transition-all group/usdt shadow-xl"
                   >
                      <div class="flex items-center gap-6">
                         <Coins :size="32" class="group-hover/usdt:rotate-12 transition-transform" />
                         <div class="text-left">
                            <p class="text-[11px] font-black uppercase tracking-widest opacity-60 group-hover/usdt:opacity-100 italic">{{ calc.showUsdHelper ? 'Cerrar conversor' : 'Ingresar valor' }}</p>
                            <p class="text-2xl font-black tracking-tight italic leading-none">Cálculo de pesos por USD</p>
                         </div>
                      </div>
                   </button>
                 </div>

                 <!-- Large USD Converter -->
                 <div v-if="calc.showUsdHelper" class="p-6 md:p-16 lg:p-24 rounded-[2rem] md:rounded-[4rem] lg:rounded-[5rem] bg-emerald-600/5 border-4 border-emerald-600/10 animate-fade-in shadow-2xl relative overflow-hidden">
                    <div class="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-[80px]"></div>
                    <div class="relative z-10 space-y-16">
                       <div class="max-w-xl mx-auto text-center space-y-8">
                          <label class="text-[14px] font-black uppercase tracking-[0.5em] text-emerald-500 mb-6 block">Valor de la Propiedad</label>
                          <div class="relative group/usd">
                            <span class="absolute left-10 top-1/2 -translate-y-1/2 font-black text-5xl opacity-10">USD</span>
                            <input
                              v-model.number="calc.houseUsd"
                              type="number"
                              class="w-full bg-white dark:bg-white/5 border-2 border-emerald-500/40 rounded-[2rem] md:rounded-[3rem] px-16 md:px-24 py-8 md:py-12 font-black outline-none focus:border-emerald-500 transition-all shadow-2xl text-center"
                              style="font-size: clamp(2rem, 8vw, 4.5rem);"
                              placeholder="0"
                            />
                          </div>
                       </div>

                       <div class="grid grid-cols-1 md:grid-cols-2 gap-12">
                          <button
                            @click="applyArsValue(arsFromUsd.oficial)"
                            class="p-8 md:p-16 rounded-[2.5rem] md:rounded-[4.5rem] bg-white dark:bg-white/5 border-2 border-emerald-500/30 hover:border-emerald-500 hover:bg-emerald-500/5 active:scale-[0.98] transition-all text-left group shadow-3xl flex flex-col justify-between cursor-pointer"
                          >
                            <div class="space-y-4">
                               <p class="text-[15px] font-black uppercase opacity-40 italic tracking-[0.4em]">Opción Oficial</p>
                               <p class="text-3xl md:text-4xl font-black text-emerald-500 leading-tight tracking-tighter whitespace-nowrap">{{ fmtCurrencyNoDec(arsFromUsd.oficial) }}</p>
                            </div>
                            <div class="pt-8 border-t border-emerald-500/20 flex items-center gap-4">
                              <span class="text-[11px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-wider italic flex-1 min-w-0">Usar Pesos Oficiales</span>
                              <div class="w-14 h-14 flex-shrink-0 rounded-full bg-emerald-500 flex items-center justify-center text-white shadow-glow-emerald group-hover:scale-110 transition-transform">
                                  <ChevronDown :size="24" class="-rotate-90" />
                              </div>
                            </div>
                          </button>
                          <button
                            @click="applyArsValue(arsFromUsd.mep)"
                            class="p-8 md:p-16 rounded-[2.5rem] md:rounded-[4.5rem] bg-white dark:bg-white/5 border-2 border-emerald-500/30 hover:border-emerald-500 hover:bg-emerald-500/5 active:scale-[0.98] transition-all text-left group shadow-3xl flex flex-col justify-between cursor-pointer"
                          >
                            <div class="space-y-4">
                               <p class="text-[15px] font-black uppercase opacity-40 italic tracking-[0.4em]">Opción MEP</p>
                               <p class="text-3xl md:text-4xl font-black text-emerald-500 leading-tight tracking-tighter whitespace-nowrap">{{ fmtCurrencyNoDec(arsFromUsd.mep) }}</p>
                            </div>
                            <div class="pt-8 border-t border-emerald-500/20 flex items-center gap-4">
                              <span class="text-[11px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-wider italic flex-1 min-w-0">Usar Pesos MEP</span>
                              <div class="w-14 h-14 flex-shrink-0 rounded-full bg-emerald-500 flex items-center justify-center text-white shadow-glow-emerald group-hover:scale-110 transition-transform">
                                  <ChevronDown :size="24" class="-rotate-90" />
                              </div>
                            </div>
                          </button>
                       </div>
                    </div>
                 </div>

                 <!-- Term Selection -->
                 <div class="pt-16 pb-8">
                    <div class="flex flex-col md:flex-row justify-between items-start md:items-end gap-10 mb-16">
                       <label class="text-[14px] font-black uppercase tracking-[0.5em] opacity-40 italic">3. Plazo de devolución del crédito</label>
                       <div class="px-14 py-6 rounded-[2.5rem] bg-emerald-500 text-white shadow-3xl shadow-emerald-500/30 text-5xl font-black tracking-tighter italic">
                          {{ calc.years }} <small class="text-xl font-black opacity-60 tracking-[0.2em] ml-4 uppercase">Años</small>
                       </div>
                    </div>
                    <div class="relative px-4">
                      <input 
                        v-model.number="calc.years" 
                        type="range" min="5" max="30" step="1" 
                        class="w-full h-8 bg-emerald-500/10 rounded-full appearance-none cursor-pointer accent-emerald-500 hover:accent-emerald-400 transition-all shadow-inner"
                      />
                      <div class="relative h-16 text-[14px] font-black opacity-40 mt-8 uppercase tracking-[0.5em] font-mono">
                        <span class="flex flex-col items-center absolute left-0 top-0">5 <small class="text-[10px] mt-2 font-black">Mín</small></span>
                        <span class="flex flex-col items-center absolute top-0" style="left: 60%; transform: translateX(-50%);">20 <small class="text-[10px] mt-2 font-black">Prom</small></span>
                        <span class="flex flex-col items-center absolute right-0 top-0">30 <small class="text-[10px] mt-2 font-black">Máx</small></span>
                      </div>
                    </div>
                 </div>
              </div>
            </div>

            <!-- STEP 3: RESULTS DASHBOARD -->
            <div class="pt-16 md:pt-32 border-t-8 border-emerald-500/10">
               <div class="space-y-10 md:space-y-20">
                  <div class="text-center space-y-4">
                    <label class="text-[12px] font-black uppercase tracking-[0.8em] text-emerald-500 block">Simulación Completada</label>
                    <h3 class="text-4xl md:text-7xl font-black tracking-tighter italic leading-none">Tu plan hipotecario final</h3>
                  </div>

                  <!-- Final Result Card -->
                  <div class="bg-gradient-to-br from-emerald-500 to-emerald-800 rounded-[3rem] md:rounded-[5rem] p-8 md:p-16 lg:p-24 text-white shadow-4xl relative overflow-hidden group/dash">
                     <div class="absolute -top-60 -right-60 w-[60rem] h-[60rem] bg-white/10 rounded-full blur-[200px] group-hover/dash:scale-125 transition-transform duration-1000"></div>
                     <div class="absolute inset-0 bg-black/10 transition-opacity"></div>
                     
                     <div class="relative z-10 grid grid-cols-1 lg:grid-cols-[1.5fr,1fr] gap-10 lg:gap-20 items-start">
                        
                        <!-- Main Metric Box -->
                        <div class="space-y-10 text-center lg:text-left pr-0 lg:pr-12">
                           <div class="space-y-4">
                              <p class="text-[16px] font-black uppercase tracking-[0.6em] opacity-60 flex items-center justify-center lg:justify-start gap-6 italic">
                                 <span class="w-12 h-1 bg-white/40"></span> Pago Mensual Estimado
                              </p>
                              <div class="flex items-baseline justify-center lg:justify-start gap-4 leading-none">
                                 <span class="text-4xl font-black text-white/40">$</span>
                                 <h4 class="font-black tracking-tighter price-value leading-none whitespace-nowrap overflow-hidden text-ellipsis" style="font-size: clamp(2.5rem, 6vw, 6rem);">{{ fmtCurrencyNoDec(monthlyPaymentARS) }}</h4>
                              </div>
                           </div>
                           <div class="inline-flex items-center gap-6 px-10 py-5 bg-white/10 backdrop-blur-3xl rounded-[2.5rem] border border-white/20 shadow-2xl">
                              <div class="w-4 h-4 rounded-full bg-white animate-pulse"></div>
                              <p class="text-lg font-black uppercase tracking-[0.2em]">Cuota Ajustable UVA</p>
                           </div>
                        </div>

                        <!-- Secondary Metrics -->
                        <div class="flex flex-col gap-4 w-full">
                           <div class="px-8 py-6 rounded-[2rem] bg-white/10 backdrop-blur-3xl border border-white/10 flex items-center justify-between transition-all hover:bg-white/15">
                              <div class="flex items-center gap-4 opacity-60">
                                 <span class="text-2xl">🧱</span>
                                 <span class="text-[11px] font-black uppercase tracking-wide">UVAs Mensuales</span>
                              </div>
                              <p class="text-3xl font-black price-value leading-none">{{ Math.round(monthlyPaymentUVA) }}</p>
                           </div>
                           <div class="px-8 py-6 rounded-[2rem] bg-white/10 backdrop-blur-3xl border border-white/10 flex items-center justify-between transition-all hover:bg-white/15">
                              <div class="flex items-center gap-4 opacity-60">
                                 <span class="text-2xl">🗓️</span>
                                 <span class="text-[11px] font-black uppercase tracking-wide">Finaliza en</span>
                              </div>
                              <p class="text-3xl font-black italic tracking-tighter leading-none">{{ endYear }}</p>
                           </div>
                           <div class="px-8 py-6 rounded-[2rem] bg-white/10 backdrop-blur-3xl border border-white/10 flex items-center justify-between transition-all hover:bg-white/15">
                              <div class="flex items-center gap-4 opacity-60">
                                 <span class="text-2xl">💡</span>
                                 <span class="text-[11px] font-black uppercase tracking-wide">Tasa banco</span>
                              </div>
                              <p class="text-3xl font-black price-value leading-none">{{ (store.rates.find(b => b.id === calc.bankId)?.tna || 0) }}<small class="text-base ml-1 font-black opacity-60">%</small></p>
                           </div>
                           <div class="px-8 py-6 rounded-[2rem] bg-white/10 backdrop-blur-3xl border border-white/10 flex items-center justify-between transition-all hover:bg-white/15">
                              <div class="flex items-center gap-4 opacity-60">
                                 <span class="text-2xl">🚀</span>
                                 <span class="text-[11px] font-black uppercase tracking-wide">Valor UVA hoy</span>
                              </div>
                              <p class="text-3xl font-black price-value leading-none">${{ Math.round(store.uvaValue) }}</p>
                           </div>
                        </div>
                     </div>

                     <!-- Final Disclaimer -->
                     <div class="mt-20 p-12 rounded-[4.5rem] bg-black/40 border-2 border-white/10 backdrop-blur-3xl flex flex-col md:flex-row items-center justify-between gap-12 group/disclaimer transition-all hover:bg-black/50 overflow-hidden">
                        <div class="flex items-center gap-10 text-center md:text-left">
                           <div class="w-16 h-16 rounded-[2rem] bg-emerald-500/20 flex items-center justify-center text-white opacity-40 group-hover/disclaimer:text-emerald-500 transition-colors">
                              <Calculator :size="32" />
                           </div>
                           <div>
                              <p class="text-[12px] font-black uppercase tracking-[0.4em] mb-2">Simulador Informativo Dolito</p>
                              <p class="text-[10px] opacity-40 font-bold max-w-sm uppercase tracking-widest leading-relaxed">Los valores son estimaciones. Consulte con su entidad para una propuesta personalizada.</p>
                           </div>
                        </div>
                        <div class="px-10 py-4 rounded-full border border-white/10 text-[10px] font-black mb-1.5 uppercase tracking-[0.6em] italic opacity-30">
                           Dolito © {{ new Date().getFullYear() }}
                        </div>
                     </div>
                  </div>
               </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Guía Educativa -->
      <section class="mt-40 max-w-4xl mx-auto space-y-24 pb-20">
        <div class="text-center">
          <div class="inline-block px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-[0.3em] mb-4" style="background-color: var(--brand-bg); color: var(--brand);">Guía Rápida</div>
          <h2 class="text-5xl font-black tracking-tighter">Entendiendo los números</h2>
        </div>
        <div class="grid md:grid-cols-2 gap-12">
          <div class="glass-container p-12 rounded-[3.5rem] border border-white/5 transition-all hover:scale-[1.02] duration-500">
            <div class="text-6xl mb-10">🛡️</div>
            <h3 class="text-2xl font-black mb-6 tracking-tight italic">¿Qué es el UVA?</h3>
            <p class="leading-relaxed text-sm font-medium opacity-80" style="color: var(--text-2);">
              Es la unidad con la que el BCRA mide el valor del ladrillo. Tu deuda se mide en UVAs, no en pesos. Si el UVA sube 10%, tu deuda y tu cuota emocional también suben 10%.
            </p>
          </div>
          <div class="glass-container p-12 rounded-[3.5rem] border border-white/5 transition-all hover:scale-[1.02] duration-500">
            <div class="text-6xl mb-10">📊</div>
            <h3 class="text-2xl font-black mb-6 tracking-tight italic">La Tasa (TNA)</h3>
            <p class="leading-relaxed text-sm font-medium opacity-80" style="color: var(--text-2);">
              Es lo que el banco te cobra de interés por encima de la inflación. Si la tasa es 4%, pagás 4% de interés anual calculado sobre tu deuda en UVAs.
            </p>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup>
import { onMounted, computed, reactive, watch } from 'vue'
import { useMortgageStore } from '@/stores/mortgages.js'
import { 
  BarChart3, Building, ChevronDown, Calendar, Coins, 
  RefreshCcw, Calculator, TrendingUp, CheckCircle, Info,
  Search
} from 'lucide-vue-next'

import { useDolarStore } from '@/stores/dolar.js'

const store = useMortgageStore()
const dolarStore = useDolarStore()

// Calculator State
const calc = reactive({
  bankId: '',
  amount: 50000000,
  years: 15,
  houseUsd: 100000,
  showUsdHelper: false,
  showBankSelector: false,
  bankSearchQuery: ''
})

const filteredBanks = computed(() => {
  const q = calc.bankSearchQuery.toLowerCase()
  return store.filteredRates
    .filter(b => b.bankName.toLowerCase().includes(q))
})

const selectedBank = computed(() => {
  return store.rates.find(b => b.id === calc.bankId) || store.rates[0]
})

// Calculations Logic
const monthlyPaymentUVA = computed(() => {
  const bank = store.rates.find(b => b.id === calc.bankId)
  if (!bank || !calc.amount || !calc.years || !store.uvaValue) return 0
  
  const loanInUvas = calc.amount / store.uvaValue
  const monthlyRate = (bank.tna / 100) / 12
  const n = calc.years * 12
  
  if (monthlyRate === 0) return loanInUvas / n
  
  return loanInUvas * (monthlyRate * Math.pow(1 + monthlyRate, n)) / (Math.pow(1 + monthlyRate, n) - 1)
})

const monthlyPaymentARS = computed(() => monthlyPaymentUVA.value * store.uvaValue)
const endYear = computed(() => new Date().getFullYear() + (calc.years || 0))

function resetFilters() {
  store.filters.maxTna = null
  store.filters.minFinancing = null
  store.sortBy = 'tna'
}

function fmtCurrencyNoDec(val) {
  if (!val) return '0'
  return new Intl.NumberFormat('es-AR', { maximumFractionDigits: 0 }).format(val)
}

function getLogoUrl(filename) {
  if (!filename) return null
  return new URL(`../assets/images/logos/${filename}`, import.meta.url).href
}

function handleImageError(e) {
  e.target.style.display = 'none'
  if (e.target.parentNode) e.target.parentNode.dataset.error = true
}

const maxTna = computed(() => {
  const vals = store.filteredRates.map(r => r.tna)
  return vals.length ? Math.max(...vals) : 10
})

const arsFromUsd = computed(() => {
  const bank = store.rates.find(b => b.id === calc.bankId)
  if (!bank || !calc.houseUsd) return { oficial: 0, mep: 0 }
  
  const financingPercent = parseInt(bank.financing) / 100
  const oficial = dolarStore.oficialRate?.venta || 0
  const mep = dolarStore.mepRate?.venta || 0
  
  return {
    oficial: calc.houseUsd * oficial * financingPercent,
    mep: calc.houseUsd * mep * financingPercent
  }
})

function applyArsValue(val) {
  calc.amount = Math.round(val)
  calc.showUsdHelper = false
}

// Sync calculator with best rate (lowest TNA) on load
watch(() => store.filteredRates, (newRates) => {
  if (newRates.length > 0) {
    calc.bankId = newRates[0].id
  }
}, { immediate: true })

onMounted(() => {
  store.fetchMortgageRates()
  dolarStore.fetchRates()
})
</script>

<style scoped>
.tracking-tight { letter-spacing: -0.02em; }
.tracking-tighter { letter-spacing: -0.05em; }

.glass-container {
  background: linear-gradient(135deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0.01) 100%);
  backdrop-filter: blur(40px);
}

.premium-card {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 2.5rem;
  box-shadow: 0 10px 30px -10px rgba(0,0,0,0.1);
  overflow: hidden;
}

.dark .premium-card {
  background: linear-gradient(135deg, rgba(30,35,45,0.7) 0%, rgba(20,25,35,0.7) 100%);
  border-color: rgba(255,255,255,0.05);
}

.price-value {
  font-family: 'Geist Mono', monospace;
  font-variant-numeric: tabular-nums;
}

.ease-out-expo {
  transition-timing-function: cubic-bezier(0.19, 1, 0.22, 1);
}

.shadow-glow-emerald {
  box-shadow: 0 0 15px rgba(16,185,129,0.3);
}

.shadow-3xl {
  box-shadow: 0 40px 100px -30px rgba(0,0,0,0.15);
}

.text-shadow-glow {
  text-shadow: 0 0 30px rgba(16,185,129,0.1);
}

.animate-fade-in {
  animation: fadeIn 0.8s ease-out;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

/* Custom inputs styling */
input[type=number]::-webkit-inner-spin-button, 
input[type=number]::-webkit-outer-spin-button { 
  -webkit-appearance: none; 
  margin: 0; 
}

input[type=range]::-webkit-slider-thumb {
  -webkit-appearance: none;
  height: 24px;
  width: 24px;
  border-radius: 50%;
  background: #10b981;
  cursor: pointer;
  border: 4px solid white;
  box-shadow: 0 5px 15px rgba(16,185,129,0.3);
}

.custom-scrollbar::-webkit-scrollbar {
  width: 4px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: rgba(255,255,255,0.05);
  border-radius: 10px;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: rgba(16,185,129,0.3);
  border-radius: 10px;
}
.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: rgba(16,185,129,0.5);
}
</style>
