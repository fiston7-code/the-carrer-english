'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'

type Props = {
  roleValue: string
  companyValue: string
  onRoleChange: (v: string) => void
  onCompanyChange: (v: string) => void
  onNext: () => void
}

export default function StepRole({
  roleValue,
  companyValue,
  onRoleChange,
  onCompanyChange,
  onNext,
}: Props) {
  const [touched, setTouched] = useState(false)
  const isValid = roleValue.trim().length > 0

  const handleNext = () => {
    setTouched(true)
    if (!isValid) return
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
        <div key={i} className={`h-1 w-8 rounded-full ${i <= 3 ? 'bg-yellow-400' : 'bg-gray-700'}`} />
      ))}
    </div>
    
      {/* Title */}
      <div className="flex flex-col gap-2">
        <h2 className="text-2xl font-bold text-foreground tracking-tight">
          Your position
        </h2>
        <p className="text-sm text-muted-foreground">
          This helps us personalize your sessions and match you with the right rooms.
        </p>
      </div>

      {/* Fields */}
      <div className="flex flex-col gap-5">

        {/* Professional Role */}
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-foreground">
            Professional role <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={roleValue}
            onChange={(e) => onRoleChange(e.target.value)}
            onBlur={() => setTouched(true)}
            placeholder="e.g. Engineer, Sales Manager, Developer..."
            className={`w-full bg-transparent border rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground outline-none transition-colors duration-200 focus:border-gold ${
              touched && !isValid
                ? 'border-red-500'
                : 'border-border hover:border-muted-foreground'
            }`}
          />
          {touched && !isValid && (
            <motion.p
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-xs text-red-500"
            >
              Professional role is required.
            </motion.p>
          )}
        </div>

        {/* Company */}
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-foreground">
            Company{' '}
            <span className="text-muted-foreground font-normal">(optional)</span>
          </label>
          <input
            type="text"
            value={companyValue}
            onChange={(e) => onCompanyChange(e.target.value)}
            placeholder="e.g. Airbus, Freelance, SNCF..."
            className="w-full bg-transparent border border-border hover:border-muted-foreground rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground outline-none transition-colors duration-200 focus:border-gold"
          />
        </div>
      </div>

      {/* Button */}
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.97 }}
        onClick={handleNext}
        className="w-full bg-gold hover:bg-gold-dim text-primary-foreground font-semibold rounded-full py-3 text-sm transition-colors duration-200"
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
//       {/* Titre */}
//       <div className="flex flex-col gap-2">
//         <h2 className="text-2xl font-bold text-foreground tracking-tight">
//           Votre poste
//         </h2>
//         <p className="text-sm text-muted-foreground">
//           Ces informations nous permettent de personnaliser votre expérience.
//         </p>
//       </div>

//       {/* Champs */}
//       <div className="flex flex-col gap-5">
//         {/* Rôle professionnel */}
//         <div className="flex flex-col gap-1.5">
//           <label className="text-sm font-medium text-foreground">
//             Rôle professionnel <span className="text-red-500">*</span>
//           </label>
//           <input
//             type="text"
//             value={roleValue}
//             onChange={(e) => onRoleChange(e.target.value)}
//             onBlur={() => setTouched(true)}
//             placeholder="ex: Ingénieur, Manager, Développeur..."
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
//               Le rôle professionnel est requis.
//             </motion.p>
//           )}
//         </div>

//         {/* Entreprise */}
//         <div className="flex flex-col gap-1.5">
//           <label className="text-sm font-medium text-foreground">
//             Entreprise{' '}
//             <span className="text-muted-foreground font-normal">(optionnel)</span>
//           </label>
//           <input
//             type="text"
//             value={companyValue}
//             onChange={(e) => onCompanyChange(e.target.value)}
//             placeholder="ex: Airbus, Freelance, SNCF..."
//             className="w-full bg-transparent border border-border hover:border-muted-foreground rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground outline-none transition-colors duration-200 focus:border-gold"
//           />
//         </div>
//       </div>

//       {/* Bouton */}
//       <motion.button
//         whileHover={{ scale: 1.02 }}
//         whileTap={{ scale: 0.97 }}
//         onClick={handleNext}
//         className="w-full bg-gold hover:bg-gold-dim text-primary-foreground font-semibold rounded-full py-3 text-sm transition-colors duration-200"
//       >
//         Continuer
//       </motion.button>
//     </motion.div>
//   )
// }