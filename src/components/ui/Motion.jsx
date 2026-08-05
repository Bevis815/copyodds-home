import { motion } from 'framer-motion'

const ease = [0.22, 1, 0.36, 1]

const motionTags = {
  div: motion.div,
  section: motion.section,
  aside: motion.aside,
  article: motion.article,
}

export function SectionReveal({ children, className = '', delay = 0, as = 'div', ...rest }) {
  const MotionTag = motionTags[as] || motion.div

  return (
    <MotionTag
      className={className}
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-8% 0px' }}
      transition={{ duration: 0.7, ease, delay }}
      {...rest}
    >
      {children}
    </MotionTag>
  )
}

export function Stagger({ children, className = '', delay = 0 }) {
  return (
    <motion.div
      className={className}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: '-6% 0px' }}
      variants={{
        hidden: {},
        show: {
          transition: { staggerChildren: 0.08, delayChildren: delay },
        },
      }}
    >
      {children}
    </motion.div>
  )
}

export function StaggerItem({ children, className = '' }) {
  return (
    <motion.div
      className={className}
      variants={{
        hidden: { opacity: 0, y: 18 },
        show: { opacity: 1, y: 0, transition: { duration: 0.55, ease } },
      }}
    >
      {children}
    </motion.div>
  )
}
