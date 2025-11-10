// Simulador de taxas — melhorias visuais e de cálculo
const qs = id => document.getElementById(id)

const amountEl = qs('amount')
const transactionTypeEl = qs('transactionType')
const installmentsEl = qs('installments')
const installmentsLabel = qs('installmentsLabel')

const rateDebitEl = qs('rateDebit')
const rateDebitCustomEl = qs('rateDebitCustom')
const rateCreditOneEl = qs('rateCreditOne')
const rateCreditOneCustomEl = qs('rateCreditOneCustom')
const rateCreditBaseEl = qs('rateCreditBase')
const rateCreditBaseCustomEl = qs('rateCreditBaseCustom')
const ratePerInstallmentEl = qs('ratePerInstallment')
const ratePerInstallmentCustomEl = qs('ratePerInstallmentCustom')

const calculateBtn = qs('calculateBtn')
const resetBtn = qs('resetBtn')
const summaryEl = qs('summary')
const tableWrapper = qs('tableWrapper')

// Formatação de moeda BRL
const fmt = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' })

function updateInstallmentsVisibility(){
  if(transactionTypeEl.value === 'credit_installments'){
    installmentsEl.disabled = false
    installmentsLabel.style.display = 'block'
  } else {
    installmentsEl.value = 1
    installmentsEl.disabled = true
    installmentsLabel.style.display = 'none'
  }
}

// Distribui centavos para garantir soma igual ao total
function distributeCents(totalAmount, parts){
  // trabalha em centavos
  const centsTotal = Math.round(totalAmount * 100)
  const base = Math.floor(centsTotal / parts)
  const remainder = centsTotal - base * parts
  const arr = Array(parts).fill(base)
  for(let i=0;i<remainder;i++) arr[i] += 1
  return arr.map(c => c / 100)
}

function calculate(){
  const amount = Math.max(0, parseFloat(amountEl.value) || 0)
  if(amount <= 0){
    summaryEl.innerHTML = '<div style="color:#c2410c">Informe um valor de venda maior que zero.</div>'
    tableWrapper.innerHTML = ''
    return
  }

  const type = transactionTypeEl.value
  const installments = Math.max(1, parseInt(installmentsEl.value) || 1)

  // taxas (lê select ou campo custom quando aplicável)
  const rateDebit = getRateValue(rateDebitEl, rateDebitCustomEl)
  const rateCreditOne = getRateValue(rateCreditOneEl, rateCreditOneCustomEl)
  const rateCreditBase = getRateValue(rateCreditBaseEl, rateCreditBaseCustomEl)
  const ratePerInstallment = getRateValue(ratePerInstallmentEl, ratePerInstallmentCustomEl)

  let effectiveRate = 0
  let modeLabel = ''

  if(type === 'debit'){
    effectiveRate = rateDebit
    modeLabel = 'Débito'
  } else if(type === 'credit_one'){
    effectiveRate = rateCreditOne
    modeLabel = 'Crédito à vista'
  } else {
    effectiveRate = rateCreditBase + (installments - 1) * ratePerInstallment
    modeLabel = `Crédito parcelado (${installments}x)`
  }

  // Totais
  const feeTotal = +(amount * effectiveRate / 100)
  const netTotal = +(amount - feeTotal)

  summaryEl.innerHTML = `
    <div><strong>${modeLabel}</strong></div>
    <div>Valor bruto: <strong>${fmt.format(amount)}</strong></div>
    <div>Taxa aplicada: <strong>${effectiveRate.toFixed(2)}%</strong></div>
    <div>Valor taxa: <strong>${fmt.format(feeTotal)}</strong></div>
    <div>Valor líquido: <strong>${fmt.format(netTotal)}</strong></div>
  `

  // Calcular distribuição das parcelas (bruto)
  const grossParts = distributeCents(amount, installments)

  // Calcular taxas por parcela proporcionalmente ao bruto da parcela
  const feeParts = grossParts.map(g => +(g * effectiveRate / 100))

  // Ajuste de centavos para garantir soma das taxas == feeTotal
  const feeSum = Math.round(feeParts.reduce((a,b) => a+b,0) * 100)/100
  let feeDiff = Math.round((feeTotal - feeSum) * 100) // diferença em centavos
  // distribuir diferença a partir da primeira parcela
  if(feeDiff !== 0){
    const sign = feeDiff > 0 ? 1 : -1
    feeDiff = Math.abs(feeDiff)
    for(let i=0;i<feeDiff;i++){
      const idx = i % installments
      feeParts[idx] = +(feeParts[idx] + (0.01 * sign)).toFixed(2)
    }
  }

  const netParts = grossParts.map((g,i) => +(g - feeParts[i]))

  // montar tabela
  let tableHTML = `
    <table>
      <thead>
        <tr>
          <th>Parcela</th>
          <th>Bruto</th>
          <th>Taxa</th>
          <th>Líquido</th>
        </tr>
      </thead>
      <tbody>
  `

  for(let i=0;i<installments;i++){
    tableHTML += `
      <tr>
        <td>${i+1} / ${installments}</td>
        <td>${fmt.format(grossParts[i])}</td>
        <td>${fmt.format(feeParts[i])}</td>
        <td>${fmt.format(netParts[i])}</td>
      </tr>
    `
  }

  tableHTML += `
      </tbody>
      <tfoot>
        <tr>
          <th>Total</th>
          <th>${fmt.format(grossParts.reduce((a,b)=>a+b,0))}</th>
          <th>${fmt.format(feeParts.reduce((a,b)=>a+b,0))}</th>
          <th>${fmt.format(netParts.reduce((a,b)=>a+b,0))}</th>
        </tr>
      </tfoot>
    </table>
  `

  tableWrapper.innerHTML = tableHTML
}


// Lê valor da select ou do custom input
function getRateValue(selectEl, customEl){
  if(!selectEl) return 0
  const v = selectEl.value
  if(v === 'custom'){
    return +(parseFloat(customEl.value) || 0)
  }
  return +(parseFloat(v) || 0)
}

// (presets removed) helper setRateOption was removed because presets UI is gone

// Mostrar/ocultar campo custom quando opção 'Personalizado' selecionada
function wireCustom(selectEl, customEl){
  if(!selectEl) return
  selectEl.addEventListener('change', ()=>{
    if(selectEl.value === 'custom') customEl.style.display = 'block'
    else customEl.style.display = 'none'
    calculate()
  })
  if(customEl) customEl.addEventListener('input', ()=> calculate())
}

// Event listeners
transactionTypeEl.addEventListener('change', ()=>{ updateInstallmentsVisibility(); calculate(); })
installmentsEl.addEventListener('input', ()=> calculate())
amountEl.addEventListener('input', ()=> calculate())

// wire selects that can have custom inputs
wireCustom(rateDebitEl, rateDebitCustomEl)
wireCustom(rateCreditOneEl, rateCreditOneCustomEl)
wireCustom(rateCreditBaseEl, rateCreditBaseCustomEl)
wireCustom(ratePerInstallmentEl, ratePerInstallmentCustomEl)

// presets removed: preset select was intentionally removed from the UI

const backBtn = qs('backBtn')
const backdrop = qs('backdrop')

calculateBtn.addEventListener('click', (e)=>{
  e.preventDefault();
  calculate();
  // mostrar resultado em destaque e esconder formulário
  document.body.classList.add('show-result')
  document.body.classList.remove('initial')
  if(backBtn) backBtn.style.display = 'inline-block'
  if(backdrop) backdrop.style.display = 'block'
})
resetBtn.addEventListener('click', (e)=>{
  e.preventDefault();
  amountEl.value = '150.00'
  transactionTypeEl.value = 'debit'
  installmentsEl.value = 1
  // reset taxa para os valores padrão definidos nos selects
  if(rateDebitEl) rateDebitEl.value = '2.5'
  if(rateDebitCustomEl) rateDebitCustomEl.style.display = 'none'
  if(rateCreditOneEl) rateCreditOneEl.value = '3.5'
  if(rateCreditOneCustomEl) rateCreditOneCustomEl.style.display = 'none'
  if(rateCreditBaseEl) rateCreditBaseEl.value = '4.5'
  if(rateCreditBaseCustomEl) rateCreditBaseCustomEl.style.display = 'none'
  if(ratePerInstallmentEl) ratePerInstallmentEl.value = '0.5'
  if(ratePerInstallmentCustomEl) ratePerInstallmentCustomEl.style.display = 'none'
  updateInstallmentsVisibility()
  calculate()
})

// Inicializa
// garantir que campos custom estejam visíveis/ocultos conforme selects atuais
;[ [rateDebitEl, rateDebitCustomEl], [rateCreditOneEl, rateCreditOneCustomEl], [rateCreditBaseEl, rateCreditBaseCustomEl], [ratePerInstallmentEl, ratePerInstallmentCustomEl] ].forEach(([s,c])=>{
  if(s && c) c.style.display = (s.value === 'custom') ? 'block' : 'none'
})
updateInstallmentsVisibility()
calculate()

// Estado inicial: formulário centralizado
document.body.classList.add('initial')

// função para fechar o destaque e voltar ao formulário
function closeResult(){
  document.body.classList.remove('show-result')
  document.body.classList.add('initial')
  if(backBtn) backBtn.style.display = 'none'
  if(backdrop) backdrop.style.display = 'none'
}

if(backBtn) backBtn.addEventListener('click', (e)=>{ e.preventDefault(); closeResult(); })
if(backdrop) backdrop.addEventListener('click', ()=> closeResult())

// fechar com Esc
document.addEventListener('keydown', (e)=>{ if(e.key === 'Escape' && document.body.classList.contains('show-result')) closeResult() })

// Ajuste da logo: esconder as iniciais se a imagem carregar corretamente
const brandLogo = qs('brandLogo')
const logoInitials = document.querySelector('.logo-initials')
if(brandLogo){
  brandLogo.addEventListener('load', ()=>{
    try{ if(brandLogo.naturalWidth > 0) logoInitials.style.display = 'none' }catch(e){}
  })
  brandLogo.addEventListener('error', ()=>{
    brandLogo.style.display = 'none'
    if(logoInitials) logoInitials.style.display = 'block'
  })
  // se já carregada
  if(brandLogo.complete){
    if(brandLogo.naturalWidth > 0) logoInitials.style.display = 'none'
    else { brandLogo.style.display = 'none'; if(logoInitials) logoInitials.style.display = 'block' }
  }
}
