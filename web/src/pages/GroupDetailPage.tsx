import { Link, useNavigate, useParams } from 'react-router-dom'
import { PageHeader } from '../components/PageHeader'
import { CurrencyAmount } from '../features/currency/components/CurrencyAmount'
import { QRShareModal } from '../features/qr-share/components/QRShareModal'
import { useQRShare } from '../features/qr-share/hooks/useQRShare'
import { createShareLink } from '../features/share-links/services/shareLinkService'
import { ShareLinkButton } from '../features/share-links/components/ShareLinkButton'
import {
  formatPaise,
  getGroupBalances,
  simplifyGroupSettlement,
} from '../lib/finance'
import { useTitanActions, useTitanState } from '../state/useTitan'

export function GroupDetailPage() {
  const navigate = useNavigate()
  const params = useParams()
  const groupId = params.groupId ?? ''
  const state = useTitanState()
  const { deleteGroup } = useTitanActions()
  const group = state.groups.find((item) => item.id === groupId)

  if (!group) {
    return (
      <div className="page">
        <PageHeader
          eyebrow="Group / Missing"
          title="Group not found"
          description="This group may have been removed from the local web store."
        />
      </div>
    )
  }

  const balances = getGroupBalances(state.splits, group.id)
  const optimized = simplifyGroupSettlement(balances)
  const relatedSplits = state.splits.filter((split) => split.groupId === group.id)
  const inviteLink = createShareLink('group-share', '/expense/new', {
    groupId: group.id,
    groupName: group.name,
    participants: group.members.join(', '),
  })
  const { open, imageUrl, openModal, closeModal } = useQRShare(inviteLink)

  return (
    <div className="page">
      <PageHeader
        eyebrow="Group / Detail"
        title={group.name}
        description={`${group.members.length} members. Use the roadmap below to minimize manual settlement steps.`}
        action={
          <div className="button-row">
            <Link className="button button-secondary" to={`/groups/new?edit=${group.id}`}>
              Edit group
            </Link>
            <Link className="button button-primary" to={`/expense/new?group=${group.id}`}>
              Add group expense
            </Link>
            <button
              className="button button-ghost"
              onClick={() => {
                deleteGroup(group.id)
                navigate('/groups')
              }}
              type="button"
            >
              Delete group
            </button>
            <button className="button button-secondary" onClick={openModal} type="button">
              Group QR
            </button>
            <ShareLinkButton createLink={() => inviteLink} />
          </div>
        }
      />

      <section className="content-grid">
        <article className="glass-panel">
          <div className="panel-head">
            <div>
              <p className="eyebrow">Settlement roadmap</p>
              <h3>Optimized payments</h3>
            </div>
          </div>

          <div className="list-block">
            {optimized.length === 0 ? (
              <p className="muted-copy">Everything here is already balanced.</p>
            ) : (
              optimized.map((payment) => (
                <article key={`${payment.from}-${payment.to}`} className="list-row list-row-static">
                  <div>
                    <strong>{payment.from}</strong>
                    <span>pays {payment.to}</span>
                  </div>
                  <strong>{formatPaise(payment.amountPaise)}</strong>
                  <span className="muted-copy">
                    <CurrencyAmount amountInInr={payment.amountPaise / 100} />
                  </span>
                </article>
              ))
            )}
          </div>
        </article>

        <article className="glass-panel">
          <div className="panel-head">
            <div>
              <p className="eyebrow">Balances</p>
              <h3>Member positions</h3>
            </div>
          </div>

          <div className="list-block">
            {balances.map((balance) => (
              <article key={balance.personId} className="list-row list-row-static">
                <div>
                  <strong>{balance.personId}</strong>
                  <span>
                    {balance.netBalancePaise >= 0 ? 'Should receive' : 'Should pay'}
                  </span>
                </div>
                <strong
                  className={
                    balance.netBalancePaise >= 0 ? 'amount-positive' : 'amount-negative'
                  }
                >
                  {formatPaise(balance.netBalancePaise)}
                </strong>
              </article>
            ))}
          </div>
        </article>
      </section>

      <section className="glass-panel">
        <div className="panel-head">
          <div>
            <p className="eyebrow">Group history</p>
            <h3>Recent expenses</h3>
          </div>
        </div>

        <div className="list-block">
          {relatedSplits.map((split) => (
            <article key={split.id} className="list-row list-row-static">
              <div>
                <strong>{split.description}</strong>
                <span>{split.participants.join(', ')}</span>
              </div>
              <strong>{formatPaise(split.amountPaise)}</strong>
            </article>
          ))}
        </div>
      </section>

      <QRShareModal
        open={open}
        title="Group expense invite"
        subtitle="Scan to open this group expense flow"
        scanValue={inviteLink}
        imageUrl={imageUrl}
        onClose={closeModal}
      />
    </div>
  )
}
