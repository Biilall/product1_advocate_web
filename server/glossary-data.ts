// Legal glossary — single source of truth for SSR (server) + API (client).
// Each entry targets a real "what is [term]" search query (AEO/glossary playbook).
// Keep shortDefinition to ~40-60 words for snippet/AI extraction.

export interface GlossaryTerm {
  slug: string;
  term: string;
  /** Short answer optimized for featured snippets & AI citation (40-60 words). */
  shortDefinition: string;
  /** Longer explanation paragraphs (HTML-safe plain text). */
  body: string[];
  /** Related practice-area page path, e.g. /services/family-law */
  relatedService?: { label: string; path: string };
  /** Slugs of related glossary terms for internal linking. */
  relatedTerms?: string[];
  category: 'Criminal' | 'Family' | 'Civil' | 'Property' | 'Corporate' | 'General';
}

export const GLOSSARY: GlossaryTerm[] = [
  {
    slug: 'khula',
    term: 'Khula',
    category: 'Family',
    shortDefinition:
      'Khula is the legal right of a Muslim wife in Pakistan to seek dissolution of her marriage through the Family Court when she cannot continue the marriage. The court grants it under the Dissolution of Muslim Marriages Act 1939, usually on return of the dower (mahr).',
    body: [
      'Khula is initiated by the wife by filing a suit for dissolution of marriage in the Family Court that has jurisdiction over her place of residence. Unlike talaq, which is pronounced by the husband, khula is granted by the court when the wife satisfies it that she cannot live with her husband within the limits prescribed by Islam.',
      'The process begins with filing a plaint, after which the court issues notice to the husband and refers the matter to an Arbitration Council for reconciliation. If reconciliation fails, the court proceeds to record evidence and ordinarily passes a decree of dissolution, typically requiring the wife to return the dower (mahr) she received.',
      'In practice, an uncontested khula in Lahore takes around 3 to 6 months. Custody of children, maintenance, and dower recovery are often dealt with alongside the khula in connected proceedings.',
    ],
    relatedService: { label: 'Family Law', path: '/services/family-law' },
    relatedTerms: ['talaq', 'hizanat', 'iddat'],
  },
  {
    slug: 'talaq',
    term: 'Talaq',
    category: 'Family',
    shortDefinition:
      'Talaq is divorce pronounced by the husband under Muslim law. In Pakistan, the husband must give written notice to the Union Council under the Muslim Family Laws Ordinance 1961, after which a 90-day reconciliation period runs before the divorce becomes effective.',
    body: [
      'Under the Muslim Family Laws Ordinance 1961, after a husband pronounces talaq he is required to give written notice to the Chairman of the relevant Union Council and a copy to the wife. Failure to give this notice is a punishable offence and can render the talaq legally ineffective.',
      'On receipt of the notice, the Union Council constitutes an Arbitration Council to attempt reconciliation between the parties. If reconciliation fails, the talaq takes effect on the expiry of 90 days from the date the notice was delivered to the Chairman, or — if the wife is pregnant — when the pregnancy ends, whichever is later.',
      'A divorce certificate is issued by the Union Council once the talaq becomes effective, which is the document required to prove the dissolution for remarriage and other purposes.',
    ],
    relatedService: { label: 'Family Law', path: '/services/family-law' },
    relatedTerms: ['khula', 'iddat'],
  },
  {
    slug: 'hizanat',
    term: 'Hizanat (Child Custody)',
    category: 'Family',
    shortDefinition:
      'Hizanat is the right of custody of a minor child under Islamic and Pakistani family law. The mother generally has the right to custody of a son until about age seven and a daughter until puberty, but the welfare of the child remains the paramount consideration for the court.',
    body: [
      'Custody disputes in Pakistan are decided by the Guardian Judge under the Guardians and Wards Act 1890 read with principles of Muslim personal law. While the mother enjoys the preferential right of hizanat for young children, this right is not absolute.',
      'The overriding test applied by the courts is the welfare of the minor — including the child\'s age, the character and capacity of each parent, the wishes of the child where old enough, and the stability each parent can offer. A parent who is otherwise entitled may be denied custody where it is not in the child\'s best interest.',
      'The parent without custody is normally granted visitation (meeting) rights, and maintenance of the child remains the legal responsibility of the father regardless of who has custody.',
    ],
    relatedService: { label: 'Family Law', path: '/services/family-law' },
    relatedTerms: ['khula', 'talaq'],
  },
  {
    slug: 'iddat',
    term: 'Iddat',
    category: 'Family',
    shortDefinition:
      'Iddat is the waiting period a Muslim woman must observe after divorce or the death of her husband before she may remarry. After divorce it is generally three menstrual cycles (or three months), and after a husband\'s death it is four months and ten days.',
    body: [
      'Iddat serves to confirm whether the woman is pregnant and, in the case of widowhood, to observe a period of mourning. Its duration depends on the circumstances of the marriage ending.',
      'After divorce, iddat is ordinarily three menstrual cycles, or three lunar months for a woman who does not menstruate. If the woman is pregnant, iddat continues until the birth of the child. After the death of the husband, the period is four months and ten days.',
      'Iddat has practical legal consequences in Pakistan, including entitlement to maintenance during the period after divorce and the timing of a valid remarriage.',
    ],
    relatedService: { label: 'Family Law', path: '/services/family-law' },
    relatedTerms: ['khula', 'talaq'],
  },
  {
    slug: 'pre-arrest-bail',
    term: 'Pre-Arrest Bail (Section 498 CrPC)',
    category: 'Criminal',
    shortDefinition:
      'Pre-arrest bail, also called anticipatory bail, is granted under Section 498 of the Code of Criminal Procedure to protect a person from arrest in a non-bailable case. It is sought when there is a reasonable apprehension of arrest, often where the accusation appears to be mala fide.',
    body: [
      'Pre-arrest bail is an extraordinary relief that allows a person who fears arrest in a non-bailable offence to approach the Sessions Court or High Court before being taken into custody. The court may grant interim pre-arrest bail and later confirm or recall it after hearing the prosecution.',
      'Courts in Pakistan grant pre-arrest bail cautiously, typically where the accusation appears to be based on mala fide intent, where the case requires further inquiry, or where arrest would amount to humiliation disproportionate to the alleged offence.',
      'An applicant must usually join the investigation and must not be a previous convict or absconder. The relief is discretionary, so strong legal grounds and timely filing are critical.',
    ],
    relatedService: { label: 'Criminal Defense', path: '/services/criminal-defense' },
    relatedTerms: ['post-arrest-bail', 'fir'],
  },
  {
    slug: 'post-arrest-bail',
    term: 'Post-Arrest Bail (Section 497 CrPC)',
    category: 'Criminal',
    shortDefinition:
      'Post-arrest bail is the release of an accused already in custody, granted under Section 497 of the Code of Criminal Procedure. In bailable offences bail is a matter of right; in non-bailable offences it is granted at the court\'s discretion based on the evidence and circumstances.',
    body: [
      'Once a person is arrested in a non-bailable case, an application for post-arrest bail can be moved before the Magistrate, Sessions Court, or High Court. The court examines whether there are reasonable grounds to believe the accused has committed the offence.',
      'Bail is generally favoured where the case calls for further inquiry, where the offence does not fall within the prohibitory clause, or where there has been a delay in trial not attributable to the accused. For offences carrying death or life imprisonment, the court applies a stricter standard.',
      'Factors such as the accused being a woman, a minor, sick or infirm, or a first-time offender can support the grant of bail. The court may impose conditions and require sureties.',
    ],
    relatedService: { label: 'Criminal Defense', path: '/services/criminal-defense' },
    relatedTerms: ['pre-arrest-bail', 'fir'],
  },
  {
    slug: 'fir',
    term: 'FIR (First Information Report)',
    category: 'Criminal',
    shortDefinition:
      'An FIR is the First Information Report registered by police under Section 154 of the Code of Criminal Procedure when information about a cognizable offence is received. It sets the criminal justice process in motion and is the first step before investigation and arrest.',
    body: [
      'An FIR records the first information about the commission of a cognizable offence. It must be registered by the officer in charge of a police station, read over to the informant, and signed, with a copy provided to the informant free of cost.',
      'Registration of an FIR does not amount to a finding of guilt — it merely triggers the investigation. If the police refuse to register an FIR, the aggrieved person can approach the higher police officers or seek a direction from the Justice of Peace under Section 22-A CrPC.',
      'A person named in an FIR for a non-bailable offence should consider seeking pre-arrest bail promptly, and may in appropriate cases file a petition for quashment of the FIR before the High Court.',
    ],
    relatedService: { label: 'Criminal Defense', path: '/services/criminal-defense' },
    relatedTerms: ['pre-arrest-bail', 'post-arrest-bail'],
  },
  {
    slug: 'iqrarnama',
    term: 'Iqrarnama (Deed of Declaration)',
    category: 'Property',
    shortDefinition:
      'An iqrarnama is a written deed of declaration or agreement used in Pakistan to record an admission, undertaking, or settlement between parties. It is commonly used in property and family matters to confirm facts such as ownership, possession, or agreed terms.',
    body: [
      'The word iqrarnama literally means a document of admission or acknowledgement. It is frequently used to record settlements, confirm receipt of payment, acknowledge possession, or set out the agreed terms of an arrangement between parties.',
      'While an iqrarnama can be strong evidence of the matters it records, its legal effect depends on its contents, proper execution, attestation by witnesses, and — where it creates or transfers rights in immovable property — registration under the Registration Act 1908.',
      'Because an unregistered or poorly drafted iqrarnama can be challenged, it is advisable to have such deeds prepared and attested with legal guidance to ensure they are admissible and enforceable.',
    ],
    relatedService: { label: 'Civil Litigation', path: '/services/civil-litigation' },
    relatedTerms: ['benami-transaction', 'decree'],
  },
  {
    slug: 'benami-transaction',
    term: 'Benami Transaction',
    category: 'Property',
    shortDefinition:
      'A benami transaction is one where property is held by or transferred to one person but the consideration is paid by another, so the real owner is hidden behind a nominal holder. In Pakistan, benami transactions are prohibited under the Benami Transactions (Prohibition) Act 2017.',
    body: [
      'In a benami arrangement the person in whose name the property stands (the benamidar) is merely a name-lender, while the true beneficial owner provides the funds. Such arrangements were historically used to conceal ownership for tax or other reasons.',
      'The Benami Transactions (Prohibition) Act 2017 prohibits benami transactions, provides for confiscation of benami property, and prescribes penalties. Certain genuine arrangements — such as property held by a trustee or in the name of a spouse or child from known sources — may fall outside the prohibition.',
      'Disputes frequently turn on who paid the consideration, the source of funds, custody of title documents, and the conduct of the parties. Expert legal advice is essential before asserting or defending a benami claim.',
    ],
    relatedService: { label: 'Civil Litigation', path: '/services/civil-litigation' },
    relatedTerms: ['iqrarnama', 'decree'],
  },
  {
    slug: 'decree',
    term: 'Decree',
    category: 'Civil',
    shortDefinition:
      'A decree is the formal expression of a court\'s adjudication that conclusively determines the rights of the parties on the matters in dispute in a civil suit. Defined in Section 2 of the Code of Civil Procedure 1908, it follows the judgment and can be preliminary or final.',
    body: [
      'A decree is the operative part of a civil court\'s decision. It crystallises the judgment into an enforceable order that determines the substantive rights of the parties, such as ownership, possession, recovery of money, or specific performance.',
      'A decree may be preliminary (deciding the rights but leaving further steps, as in a partition suit) or final (completely disposing of the suit). Once drawn up, a decree can be executed through the court\'s execution process if the losing party does not comply.',
      'A party aggrieved by a decree may file an appeal within the limitation period. Understanding whether an order is a decree or merely an interlocutory order is important because it affects the available remedy.',
    ],
    relatedService: { label: 'Civil Litigation', path: '/services/civil-litigation' },
    relatedTerms: ['iqrarnama', 'benami-transaction'],
  },
];

export function getGlossaryTerm(slug: string): GlossaryTerm | undefined {
  return GLOSSARY.find((t) => t.slug === slug);
}
