'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Phone } from 'lucide-react' // Importe l'icône pour le style

type Props = {
  roleValue: string
  companyValue: string
  phoneValue: string // Nouveau prop
  onRoleChange: (v: string) => void
  onCompanyChange: (v: string) => void
  onPhoneChange: (v: string) => void // Nouveau prop
  onNext: () => void
}

export default function StepRole({
  roleValue,
  companyValue,
  phoneValue,
  onRoleChange,
  onCompanyChange,
  onPhoneChange,
  onNext,
}: Props) {
  const [touched, setTouched] = useState(false)
  
  // Validation : Le rôle est obligatoire, le téléphone est fortement recommandé
  const isRoleValid = roleValue.trim().length > 0
  const isPhoneValid = phoneValue.trim().length >= 10 // Minimum pour un numéro avec indicatif

  const handleNext = () => {
    setTouched(true)
    if (!isRoleValid) return
    onNext()
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -24 }}
      transition={{ duration: 0.35, ease: 'easeInOut' }}
      className="w-full max-w-md flex flex-col gap-8"
    >
      {/* Progress dots */}
      <div className="flex gap-2">
        {[0, 1, 2, 3, 4].map((i) => (
          <div key={i} className={`h-1 w-8 rounded-full ${i <= 3 ? 'bg-gold' : 'bg-muted'}`} />
        ))}
      </div>

      {/* Title */}
      <div className="flex flex-col gap-2">
        <h2 className="text-2xl font-bold text-foreground tracking-tight uppercase">
          Professional Profile
        </h2>
        <p className="text-sm text-muted-foreground italic">
          We use this to match you with peers and send WhatsApp session reminders.
        </p>
      </div>

      {/* Fields */}
      <div className="flex flex-col gap-6">

        {/* Professional Role */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-black uppercase tracking-widest text-foreground">
            Professional role <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={roleValue}
            onChange={(e) => onRoleChange(e.target.value)}
            onBlur={() => setTouched(true)}
            placeholder="e.g. Developer, Manager..."
            className={`w-full bg-surface border rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground outline-none transition-all focus:border-gold ${
              touched && !isRoleValid ? 'border-red-500' : 'border-border'
            }`}
          />
        </div>

        {/* WhatsApp Phone Number */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-black uppercase tracking-widest text-foreground">
            WhatsApp Number <span className="text-gold">*</span>
          </label>
          <div className="relative">
             <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground">
                <Phone size={14} />
             </span>
             <input
                type="tel"
                value={phoneValue}
                onChange={(e) => onPhoneChange(e.target.value)}
                placeholder="+243..."
                className="w-full bg-surface border border-border rounded-xl pl-10 pr-4 py-3 text-sm text-foreground focus:border-gold outline-none transition-all"
              />
          </div>
          <p className="text-[10px] text-muted-foreground">Format: +243XXXXXXXXX</p>
        </div>

        {/* Company */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-black uppercase tracking-widest text-foreground">
            Company <span className="text-muted-foreground font-normal">(optional)</span>
          </label>
          <input
            type="text"
            value={companyValue}
            onChange={(e) => onCompanyChange(e.target.value)}
            placeholder="e.g. Kalkan Tech, Freelance..."
            className="w-full bg-surface border border-border rounded-xl px-4 py-3 text-sm text-foreground focus:border-gold outline-none transition-all"
          />
        </div>
      </div>

      {/* Button */}
      <motion.button
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.98 }}
        onClick={handleNext}
        className="w-full bg-gold hover:bg-gold/90 text-black font-black rounded-xl py-4 text-sm uppercase tracking-[0.2em] shadow-lg transition-all"
      >
        Continue
      </motion.button>
    </motion.div>
  )
}

// 'use client'

// import { useState } from 'react'
// import { motion } from 'framer-motion'

// type Props = {
//   roleValue: string
//   companyValue: string
//   onRoleChange: (v: string) => void
//   onCompanyChange: (v: string) => void
//   onNext: () => void
// }

// export default function StepRole({
//   roleValue,
//   companyValue,
//   onRoleChange,
//   onCompanyChange,
//   onNext,
// }: Props) {
//   const [touched, setTouched] = useState(false)
//   const isValid = roleValue.trim().length > 0

//   const handleNext = () => {
//     setTouched(true)
//     if (!isValid) return
//     onNext()
//   }

//   return (
//     <motion.div
//       initial={{ opacity: 0, y: 24 }}
//       animate={{ opacity: 1, y: 0 }}
//       exit={{ opacity: 0, y: -24 }}
//       transition={{ duration: 0.35, ease: 'easeInOut' }}
//       className="w-full max-w-md flex flex-col gap-8"
//     >
//       {/* Progress dots */}
//       <div className="flex gap-2">
//         {[0, 1, 2, 3, 4].map((i) => (
//           <div key={i} className={`h-1 w-8 rounded-full ${i <= 3 ? 'bg-gold' : 'bg-muted'}`} />
//         ))}
//       </div>

//       {/* Title */}
//       <div className="flex flex-col gap-2">
//         <h2 className="text-2xl font-bold text-foreground tracking-tight">
//           Your position
//         </h2>
//         <p className="text-sm text-muted-foreground">
//           This helps us personalize your sessions and match you with the right rooms.
//         </p>
//       </div>

//       {/* Fields */}
//       <div className="flex flex-col gap-5">

//         {/* Professional Role */}
//         <div className="flex flex-col gap-1.5">
//           <label className="text-sm font-medium text-foreground">
//             Professional role <span className="text-red-500">*</span>
//           </label>
//           <input
//             type="text"
//             value={roleValue}
//             onChange={(e) => onRoleChange(e.target.value)}
//             onBlur={() => setTouched(true)}
//             placeholder="e.g. Engineer, Sales Manager, Developer..."
//             className={`w-full bg-transparent border rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground outline-none transition-colors duration-200 focus:border-gold ${
//               touched && !isValid
//                 ? 'border-red-500'
//                 : 'border-border hover:border-muted-foreground'
//             }`}
//           />
//           {touched && !isValid && (
//             <motion.p
//               initial={{ opacity: 0, y: -4 }}
//               animate={{ opacity: 1, y: 0 }}
//               className="text-xs text-red-500"
//             >
//               Professional role is required.
//             </motion.p>
//           )}
//         </div>

//         {/* Company */}
//         <div className="flex flex-col gap-1.5">
//           <label className="text-sm font-medium text-foreground">
//             Company{' '}
//             <span className="text-muted-foreground font-normal">(optional)</span>
//           </label>
//           <input
//             type="text"
//             value={companyValue}
//             onChange={(e) => onCompanyChange(e.target.value)}
//             placeholder="e.g. Airbus, Freelance, SNCF..."
//             className="w-full bg-transparent border border-border hover:border-muted-foreground rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground outline-none transition-colors duration-200 focus:border-gold"
//           />
//         </div>
//       </div>

//       {/* Button */}
//       <motion.button
//         whileHover={{ scale: 1.02 }}
//         whileTap={{ scale: 0.97 }}
//         onClick={handleNext}
//         className="w-full bg-gold hover:bg-gold-dim text-primary-foreground font-semibold rounded-full py-3 text-sm transition-colors duration-200"
//       >
//         Continue
//       </motion.button>
//     </motion.div>
//   )
// }
