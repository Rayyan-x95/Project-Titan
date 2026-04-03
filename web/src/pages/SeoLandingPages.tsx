import { Link } from 'react-router-dom'
import { PageHeader } from '../components/PageHeader'
import { SeoMeta } from '../components/SeoMeta'

type SeoPageProps = {
  title: string
  description: string
  canonicalPath: string
  h1: string
  lead: string
  points: string[]
}

function SeoPage({ title, description, canonicalPath, h1, lead, points }: SeoPageProps) {
  return (
    <div className="page">
      <SeoMeta
        title={title}
        description={description}
        canonicalPath={canonicalPath}
        keywords="expense tracker india, budget app for students, upi expense tracker, split expense app, money manager app"
      />

      <PageHeader
        eyebrow="Titan Guides"
        title={h1}
        description={lead}
        action={
          <Link className="button button-primary" to="/expense/new">
            Start tracking daily expenses
          </Link>
        }
      />

      <section className="glass-panel">
        <div className="panel-head">
          <div>
            <p className="eyebrow">Why Titan</p>
            <h3>Built for India-first money habits</h3>
          </div>
        </div>

        <div className="list-block">
          {points.map((point) => (
            <article className="list-row list-row-static" key={point}>
              <div>
                <strong>{point}</strong>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="glass-panel">
        <div className="panel-head">
          <div>
            <p className="eyebrow">Related pages</p>
            <h3>Explore money workflows</h3>
          </div>
        </div>
        <div className="chip-row">
          <Link className="chip chip-button" to="/expense-tracker-india">
            Expense tracker India guide
          </Link>
          <Link className="chip chip-button" to="/budget-app-for-students">
            Budget app for students guide
          </Link>
          <Link className="chip chip-button" to="/split-expense-app-india">
            Split expense app India guide
          </Link>
          <Link className="chip chip-button" to="/insights">
            Track spending insights
          </Link>
        </div>
      </section>
    </div>
  )
}

export function ExpenseTrackerIndiaPage() {
  return (
    <SeoPage
      title="Expense Tracker India: Daily Spending App | Titan"
      description="Use Titan as your expense tracker India app to track daily spending, UPI expenses, and budgets in one place."
      canonicalPath="/expense-tracker-india"
      h1="Expense tracker India users can rely on"
      lead="Titan helps you track daily expenses, manage categories, and build better money decisions without spreadsheet chaos."
      points={[
        'Track your daily expenses effortlessly with smart categories.',
        'Monitor UPI spending and keep your monthly budget on track.',
        'Review weekly trends to avoid overspending before salary day.',
      ]}
    />
  )
}

export function BudgetAppForStudentsPage() {
  return (
    <SeoPage
      title="Budget App for Students in India | Titan"
      description="Titan is a simple budget app for college students in India with expense tracking, reminders, and habit rewards."
      canonicalPath="/budget-app-for-students"
      h1="Budget app for students who want control"
      lead="From pocket money to hostel life, Titan gives students a practical budget planner with fast daily tracking."
      points={[
        'Plan weekly and monthly limits in a student-friendly budget flow.',
        'Use can I afford this logic before spending on impulse purchases.',
        'Build saving habits with streaks and rewards that keep momentum high.',
      ]}
    />
  )
}

export function SplitExpenseAppIndiaPage() {
  return (
    <SeoPage
      title="Split Expense App India: Friends and Groups | Titan"
      description="Titan is an app to split expenses with friends in India, manage shared groups, and settle balances faster."
      canonicalPath="/split-expense-app-india"
      h1="Split expenses with friends easily"
      lead="Create shared groups, add expenses, and settle faster with clear payment roadmaps designed for India-first users."
      points={[
        'Add group expenses quickly and track who owes what in real time.',
        'Avoid awkward reminders with clear settlement actions.',
        'Handle roommate bills, trips, and monthly shared costs in one app.',
      ]}
    />
  )
}
