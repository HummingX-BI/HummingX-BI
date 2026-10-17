// api/_scripts/protected_fingerprint.js
const crypto = require('crypto');
const { PrismaClient } = require('@prisma/client');
const { KNOWN_PROTECTED_IDS, isProtectedUser } = require('./protected');

const prisma = new PrismaClient();

function stableStringify(obj) {
  if (obj === null || obj === undefined) return 'null';
  if (typeof obj !== 'object') return JSON.stringify(obj);
  if (Array.isArray(obj)) {
    return '[' + obj.map(stableStringify).join(',') + ']';
  }
  const keys = Object.keys(obj).sort();
  return '{' + keys.map(k => `${JSON.stringify(k)}:${stableStringify(obj[k])}`).join(',') + '}';
}

async function getProtectedFingerprints() {
  const users = await prisma.user.findMany({
    where: {
      id: { in: Array.from(KNOWN_PROTECTED_IDS) }
    },
    include: {
      projects: {
        orderBy: { id: 'asc' },
        include: {
          payments: { orderBy: { id: 'asc' } }
        }
      },
      creditMovements: { orderBy: { id: 'asc' } },
      referralsMade: { orderBy: { id: 'asc' } }
    },
    orderBy: { id: 'asc' }
  });

  const fingerprints = {};

  for (const u of users) {
    // Clone and remove transient fields that change naturally on client login
    const userClean = { ...u };
    delete userClean.lastLoginAt;
    delete userClean.loginCount;
    delete userClean.totalTimeSpent;
    delete userClean.updatedAt;

    const allPayments = (u.projects || []).flatMap(p => p.payments || []);
    const referralIds = (u.referralsMade || []).map(r => r.id).filter(Boolean);
    const prospectConditions = [{ convertedToClientId: u.id }];
    if (u.referralCode) {
      prospectConditions.push({ referralCode: u.referralCode });
    }
    if (referralIds.length > 0) {
      prospectConditions.push({ referralId: { in: referralIds } });
    }

    const linkedProspects = await prisma.prospect.findMany({
      where: {
        OR: prospectConditions
      },
      orderBy: { id: 'asc' }
    });

    const dataStr = stableStringify({
      user: userClean,
      projects: u.projects,
      payments: allPayments,
      creditMovements: u.creditMovements,
      referrals: u.referralsMade,
      prospects: linkedProspects
    });

    const hash = crypto.createHash('sha256').update(dataStr).digest('hex');
    fingerprints[u.id] = {
      name: u.name,
      companyName: u.companyName,
      hash,
      counts: {
        projects: u.projects.length,
        payments: allPayments.length,
        creditMovements: u.creditMovements.length,
        referrals: (u.referralsMade || []).length,
        prospects: linkedProspects.length
      }
    };
  }

  return fingerprints;
}

if (require.main === module) {
  getProtectedFingerprints()
    .then(fps => {
      console.log(JSON.stringify(fps, null, 2));
      process.exit(0);
    })
    .catch(err => {
      console.error(err);
      process.exit(1);
    })
    .finally(() => prisma.$disconnect());
}

module.exports = { getProtectedFingerprints, stableStringify };
