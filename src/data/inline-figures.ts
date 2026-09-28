export type PlotKind =
  | 'morse' | 'phase-energy' | 'gaussians' | 'shells' | 'hf-ledger'
  | 'convergence' | 'saddle' | 'force' | 'reaction' | 'occupations'
  | 'determinants' | 'entropy' | 'rank-error' | 'factor-storage'
  | 'interference' | 'bell' | 'sectors' | 'support' | 'trotter'
  | 'walk-phases' | 'shots' | 'covariance' | 'qpe-bins' | 'aliases'
  | 'amplification' | 'drive' | 'memory' | 'accuracy' | 'qpe-work'
  | 'logical-error' | 'pareto';
export type DiagramKind =
  | 'representation' | 'decisions' | 'rotation' | 'connectivity'
  | 'active-partition' | 'mcscf' | 'fermion-sign' | 'conversions'
  | 'fresh-qpe' | 'lattice' | 'artifacts' | 'jobs' | 'tool-call'
  | 'test-layers' | 'handoffs';
export interface InlineFigure {
  id: string;
  lesson: number;
  anchor: string;
  afterParagraph: number;
  title: string;
  provenance: 'Analytical illustration' | 'Lesson teaching example' | 'Synthetic illustration' | 'Conceptual diagram';
  assumptions: string;
  takeaway: string;
  plot?: PlotKind;
  diagram?: DiagramKind;
  interaction?: 'separation' | 'shots' | 'qpe-bits' | 'pareto';
}

export const inlineFigures: InlineFigure[] = [
  {
    id: 'bond-energy', lesson: 1, anchor: 'section-one-geometry-gives-one-point-not-the-whole-bond-breaking-story', afterParagraph: 3,
    title: 'One separation gives one point on an energy curve', plot: 'morse', interaction: 'separation',
    provenance: 'Analytical illustration',
    assumptions: 'Illustrative analytical model—not computed N₂ data. Set x = R/Rₑ and a = 2: E/Dₑ = (1 − exp[−2(x − 1)])² − 1. Rₑ and Dₑ are arbitrary scales, not nitrogen parameters. The dissociation reference is zero.',
    takeaway: 'Short distances are repulsive; the minimum is at x = 1. Stretching approaches the zero-energy dissociation limit. Moving the marker selects a geometry, not a time step.',
  },
  {
    id: 'representation-layers', lesson: 2, anchor: 'section-3-build-the-description-in-layers-basis-functions-orbitals-and-electron-states', afterParagraph: 2,
    title: 'Three layers that must not be mistaken for each other', diagram: 'representation', provenance: 'Conceptual diagram',
    assumptions: 'A map of the basis/orbital/many-electron distinctions introduced here. Arrows mean mathematical construction, not electrons moving between boxes.',
    takeaway: 'Orbital coefficients combine basis functions; CI amplitudes combine determinants. They are coefficients of different objects.',
  },
  {
    id: 'relative-phase-energy', lesson: 2, anchor: 'section-a-small-numerical-example-why-relative-signs-matter', afterParagraph: 8,
    title: 'Identical occupation probabilities, different energy', plot: 'phase-energy', provenance: 'Lesson teaching example',
    assumptions: 'Uses the exact two-determinant teaching matrix in this section: HAA = HBB = −1 Eh and HAB = −0.2 Eh. For (A + exp(iφ)B)/√2, the expectation is −1 − 0.2 cos φ Eh. Not a molecular calculation.',
    takeaway: 'Every point has 50% probability on A and B. Changing their relative phase changes interference, and therefore the energy expectation.',
  },
  {
    id: 'four-independent-choices', lesson: 3, anchor: 'section-four-decisions-that-must-not-be-confused', afterParagraph: 2,
    title: 'Change one choice and know what changed', diagram: 'decisions', provenance: 'Conceptual diagram',
    assumptions: 'Examples are those named in this section. Equal API contracts do not imply equal implementations, stopping criteria, or results.',
    takeaway: 'A basis choice changes the representational space; a backend choice changes who implements a task. Those are not the same experiment.',
  },
  {
    id: 'gaussian-widths', lesson: 4, anchor: 'section-a-basis-set-is-a-vocabulary-for-orbital-shapes', afterParagraph: 3,
    title: 'A Gaussian exponent controls spatial extent', plot: 'gaussians', provenance: 'Analytical illustration',
    assumptions: 'Unnormalized one-dimensional shapes g(x) = exp(−αx²), with α = 0.5 and 4 in arbitrary inverse-length-squared units. Equal peak height isolates width; these are not normalized 3D orbitals or a supplied basis set.',
    takeaway: 'A larger exponent is tight near its center. A smaller exponent has a diffuse tail. Neither curve is an electron trajectory.',
  },
  {
    id: 'shell-function-counts', lesson: 4, anchor: 'section-shells-make-the-representation-concrete', afterParagraph: 3,
    title: 'One shell contains several angular functions', plot: 'shells', provenance: 'Analytical illustration',
    assumptions: 'For angular momentum ℓ, spherical count = 2ℓ + 1; Cartesian count = (ℓ + 1)(ℓ + 2)/2. Counts shown for s through g; they are functions, not electrons or guaranteed backend capabilities.',
    takeaway: 'Spherical and Cartesian counts first differ at d. Adding a shell is not the same as adding a single spatial orbital.',
  },
  {
    id: 'hf-double-counting', lesson: 5, anchor: 'section-total-energy-is-not-a-sum-of-orbital-energies', afterParagraph: 3,
    title: 'The same toy mean field has three different energy totals', plot: 'hf-ledger', provenance: 'Lesson teaching example',
    assumptions: 'Uses the section’s one-basis-function, two-electron algebra example: h = −1 Eh, (11|11) = 0.4 Eh, nuclear constant = 0.1 Eh. F = −0.6 Eh; 2F = −1.2, electronic energy = −1.6, total = −1.5 Eh. Not computed chemistry.',
    takeaway: 'Summed orbital eigenvalues double-count the pair contribution. Correct the interaction bookkeeping, then add the nuclear constant exactly once.',
  },
  {
    id: 'scf-residual-traces', lesson: 6, anchor: 'section-read-the-stopping-conditions-not-just-the-last-energy-change', afterParagraph: 2,
    title: 'A small energy change can hide a larger residual', plot: 'convergence', provenance: 'Synthetic illustration',
    assumptions: 'Invented normalized diagnostics: energy-change magnitude = 10^(−2 − 0.7k); stationarity residual = 10^(−1 − 0.25k)(1 + 0.3 sin k). Each uses its own arbitrary normalization. Not an SCF run or the native stopping thresholds.',
    takeaway: 'The logarithmic axis exposes orders of magnitude. Track the residuals the solver actually tests instead of declaring convergence from an almost-flat energy trace.',
  },
  {
    id: 'orbital-saddle', lesson: 6, anchor: 'section-stability-is-curvature-not-another-convergence-tolerance', afterParagraph: 3,
    title: 'A stationary orbital solution can still have a downhill direction', plot: 'saddle', provenance: 'Lesson teaching example',
    assumptions: 'Exact cross-sections of the section’s synthetic surface E(u,v) − E₀ = 0.2u² − 0.05v². u and v are orbital-rotation coordinates, not nuclear separations. Arbitrary energy units.',
    takeaway: 'Both slopes vanish at zero, but the v direction has negative curvature. Stationarity alone cannot classify the point as a minimum.',
  },
  {
    id: 'energy-slope-force', lesson: 7, anchor: 'section-the-energy-surface-has-nuclear-coordinates-as-its-arguments', afterParagraph: 3,
    title: 'Force points opposite to the energy slope', plot: 'force', provenance: 'Analytical illustration',
    assumptions: 'The same dimensionless Morse model as Lesson 1: z = exp[−2(x − 1)], slope = 4z(1 − z), normalized force = −slope. At x = 1 the curvature is 8. Force here is F/(Dₑ/Rₑ), not newtons or a computed N₂ force.',
    takeaway: 'Below equilibrium the force pushes separation outward. Above equilibrium it pulls inward. Both force and slope vanish at the minimum, while curvature remains positive.',
  },
  {
    id: 'reaction-coordinate-barrier', lesson: 7, anchor: 'section-geometry-optimization-asks-a-different-scientific-question', afterParagraph: 2,
    title: 'A reaction barrier is not a diatomic dissociation curve', plot: 'reaction', provenance: 'Analytical illustration',
    assumptions: 'Synthetic one-dimensional profile E(q) = (q² − 1)², with arbitrary reaction coordinate q and energy units. Minima at q = ±1 and a maximum at q = 0. This one coordinate alone does not establish a full molecular transition state.',
    takeaway: 'A transition-state search requires one unstable internal direction and stable remaining directions. “Minimize harder” would move away from the barrier.',
  },
  {
    id: 'same-span-rotation', lesson: 8, anchor: 'section-what-an-orbital-rotation-doesand-what-it-does-not-preserve', afterParagraph: 2,
    title: 'A new pair of axes can span the same plane', diagram: 'rotation', provenance: 'Analytical illustration',
    assumptions: 'Two orthonormal basis vectors rotated by π/4: u′ = (u + v)/√2 and v′ = (−u + v)/√2. A geometric analogy for orbital coordinates, not orbital densities.',
    takeaway: 'A complete, consistently transformed space is unchanged. Discarding an axis afterward is an additional approximation, not a rotation.',
  },
  {
    id: 'natural-occupation-spectrum', lesson: 8, anchor: 'section-natural-orbitals-diagonalize-density-not-spatial-spread', afterParagraph: 3,
    title: 'Diagonalizing a density turns coherence into occupation eigenvalues', plot: 'occupations', provenance: 'Lesson teaching example',
    assumptions: 'The section’s illustrative spin-traced 1-RDM is [[1, 0.3], [0.3, 1]]. Its diagonal entries in the original basis are 1 and 1; natural occupation eigenvalues are 1.3 and 0.7. Their sum remains two electrons.',
    takeaway: 'Natural occupations are eigenvalues of a density matrix, not energies. Natural orbitals need not be spatially localized.',
  },
  {
    id: 'slater-condon-mask', lesson: 9, anchor: 'section-slatercondon-connectivity-keeps-the-matrix-structured', afterParagraph: 2,
    title: 'Excitation distance limits which determinants can couple', diagram: 'connectivity', provenance: 'Analytical illustration',
    assumptions: 'Three electrons in six ordered spin modes: 111000, 110100, 100110, 000111. For a one- plus two-body Hamiltonian, pairs separated by more than two excitations must have zero matrix element. Allowed does not mean nonzero for every integral set.',
    takeaway: 'The matrix has a structural zero between 111000 and 000111. Keep fermionic signs and actual integrals when evaluating the allowed entries.',
  },
  {
    id: 'configuration-growth', lesson: 9, anchor: 'section-fci-casci-and-selected-ci-reduce-different-things', afterParagraph: 2,
    title: 'Complete can still become combinatorially large', plot: 'determinants', provenance: 'Analytical illustration',
    assumptions: 'Even M spatial orbitals with N = M electrons. Compare all fixed-N determinants C(2M,M) with fixed Nα = Nβ = M/2 determinants C(M,M/2)². Exact counts, not timings or a total-spin projection.',
    takeaway: 'At six spatial orbitals the two counts are 924 and 400. Selecting orbitals and selecting determinants reduce different spaces.',
  },
  {
    id: 'active-space-bookkeeping', lesson: 10, anchor: 'section-active-inactive-and-excluded-are-physical-modeling-choices', afterParagraph: 3,
    title: 'Four inactive, six active, eighteen excluded', diagram: 'active-partition', provenance: 'Lesson teaching example',
    assumptions: 'Bookkeeping from the described 28-spatial-orbital, 14-electron reference: 4 inactive orbitals hold 8 electrons; 6 active orbitals share 6 electrons; 18 excluded orbitals remain outside the correlated model. No energy accuracy is implied.',
    takeaway: 'All 28 orbitals are accounted for, and the active electron count is not the total molecular electron count.',
  },
  {
    id: 'orbital-entropy', lesson: 10, anchor: 'section-entropy-measures-uncertainty-of-an-orbitals-occupation', afterParagraph: 3,
    title: 'Local uncertainty grows toward four equal probabilities', plot: 'entropy', provenance: 'Analytical illustration',
    assumptions: 'A chosen probability path p = (1 − 3t/4, t/4, t/4, t/4), 0 ≤ t ≤ 1. Entropy = −Σ p ln p, taking 0 ln 0 = 0. The four outcomes are empty, alpha, beta, and doubly occupied. Natural-log units (nats), not bits.',
    takeaway: 'A definite occupation has zero entropy; four equally likely states give ln 4. Entropy depends on the chosen orbital subsystem and does not certify chemical accuracy.',
  },
  {
    id: 'mcscf-nested-updates', lesson: 11, anchor: 'section-macro-and-micro-iterations-have-different-jobs', afterParagraph: 2,
    title: 'Two coupled optimization problems, not two independent switches', diagram: 'mcscf', provenance: 'Conceptual diagram',
    assumptions: 'The diagram explains the macro/micro distinction in this section. Actual orbital-update machinery is delegated to the supported external solver; this is not a recorded iteration trace.',
    takeaway: 'Changing orbitals changes integrals and therefore the CI problem. Cheap local orbital steps still need a refreshed correlated solution.',
  },
  {
    id: 'factorization-residual', lesson: 12, anchor: 'section-cholesky-uses-the-coulomb-tensors-pair-structure', afterParagraph: 3,
    title: 'Retained rank and residual are different quantities', plot: 'rank-error', provenance: 'Analytical illustration',
    assumptions: 'Exact diagonal PSD toy G = diag(4, 1, 1/4, 1/16). Retain the largest r diagonal Cholesky columns; plot ||G − LᵣLᵣᵀ||F / ||G||F. This is an explicit toy residual, not a guaranteed chemistry-energy error.',
    takeaway: 'The fourth column makes this toy representation exact. A small tensor norm residual still needs a separate connection to the scientific observable.',
  },
  {
    id: 'factor-storage-scaling', lesson: 12, anchor: 'section-canonical-four-center-storage-is-simple-and-expensive', afterParagraph: 1,
    title: 'Avoid rebuilding the dense object you compressed', plot: 'factor-storage', provenance: 'Analytical illustration',
    assumptions: 'Raw float64 storage only: K⁴ entries for the dense four-index tensor versus K²r for factors, choosing r = K illustratively. Eight bytes per entry; MiB = 2²⁰ bytes. Excludes symmetry packing, copies, workspace, and real rank behavior.',
    takeaway: 'A getter that materializes all K⁴ entries can erase the factor-storage benefit. These formulas are storage arithmetic, not measured backend memory.',
  },
  {
    id: 'phase-interference-probabilities', lesson: 13, anchor: 'section-worked-interference-a-phase-change-becomes-a-different-outcome', afterParagraph: 2,
    title: 'The last Hadamard turns phase into probability', plot: 'interference', provenance: 'Analytical illustration',
    assumptions: 'Ideal |0⟩ → H → diag(1, exp(iφ)) → H. P(0) = cos²(φ/2), P(1) = sin²(φ/2). No intermediate measurement, no noise, and no samples. Z is the φ = π case discussed here.',
    takeaway: 'Before recombination both paths have equal probabilities. After it, phase determines whether amplitudes reinforce or cancel.',
  },
  {
    id: 'bell-versus-mixture', lesson: 13, anchor: 'section-cnot-creates-correlations-coherently', afterParagraph: 3,
    title: 'The same Z outcomes can hide different coherence', plot: 'bell', provenance: 'Analytical illustration',
    assumptions: 'Compare |Φ+⟩ = (|00⟩ + |11⟩)/√2 with the incoherent 50/50 mixture of |00⟩ and |11⟩. Both have ⟨Z₀⟩ = 0 and ⟨Z₀Z₁⟩ = 1, but ⟨X₀X₁⟩ is 1 for the Bell state and 0 for the mixture.',
    takeaway: 'Computational-basis correlations alone do not establish entanglement. A different measurement basis can reveal the lost coherence.',
  },
  {
    id: 'jordan-wigner-signs', lesson: 14, anchor: 'section-jordanwigner-making-the-fermionic-sign-visible', afterParagraph: 2,
    title: 'A Z prefix is an occupation-parity calculator', diagram: 'fermion-sign', provenance: 'Analytical illustration',
    assumptions: 'Occupations [1,0,1,0] in increasing mode order from left to right, not a software bitstring convention. Removing mode 2 crosses one occupied earlier mode, so the amplitude changes sign.',
    takeaway: 'Every occupied earlier mode contributes −1; every empty earlier mode contributes +1. This is how the mapping retains fermionic ordering.',
  },
  {
    id: 'symmetry-sector-spectra', lesson: 15, anchor: 'section-a-two-qubit-tapering-example-by-hand', afterParagraph: 3,
    title: 'Different parity sectors have different spectra', plot: 'sectors', provenance: 'Analytical illustration',
    assumptions: 'Use the lesson’s Hs = (a + sb)Z + cX with chosen a = 0.6, b = 0.4, c = 0.3 (arbitrary energy units), s = ±1. Eigenvalues are ±√((a + sb)² + c²). Fixed parity is not fixed electron number.',
    takeaway: 'Choosing a sector is a physical constraint, not merely a smaller-qubit-count trick. The wrong sector gives a different low energy.',
  },
  {
    id: 'retained-support-fidelity', lesson: 16, anchor: 'section-overlap-truncation-and-reoptimization', afterParagraph: 2,
    title: 'Retained probability mass equals fidelity to the original expansion', plot: 'support', provenance: 'Synthetic illustration',
    assumptions: 'Chosen normalized orthonormal determinant weights: 0.55, 0.25, 0.12, 0.06, 0.02. Truncate in descending order and renormalize, preserving alignment and phase. Squared overlap with this original vector equals the retained mass.',
    takeaway: 'Keeping three terms retains 92% weight. That is fidelity to the original approximate expansion, not automatically to the true ground state.',
  },
  {
    id: 'supported-circuit-routes', lesson: 17, anchor: 'section-the-exact-conversion-paths', afterParagraph: 3,
    title: 'A representation wrapper is not an all-to-all converter', diagram: 'conversions', provenance: 'Conceptual diagram',
    assumptions: 'Summarizes the pinned implementation paths described in this section, including optional-dependency and target-profile boundaries. Arrows are supported routes, not universal equivalences.',
    takeaway: 'Check which representation is actually present and which consumer is supported before requesting a conversion.',
  },
  {
    id: 'product-formula-error-trends', lesson: 18, anchor: 'section-trotter-and-suzuki-product-formulas', afterParagraph: 3,
    title: 'First and second order describe trends, not “twice as accurate”', plot: 'trotter', provenance: 'Analytical illustration',
    assumptions: 'Normalized asymptotic guides 1/N and 1/N² at fixed evolution time with prefactors chosen as one. Log-log axes. Not a rigorous error bound, measured Hamiltonian error, or equal-gate-budget comparison.',
    takeaway: 'The second-order guide falls faster with step count, but each step can cost more and real commutator-dependent constants matter.',
  },
  {
    id: 'walk-energy-phase', lesson: 19, anchor: 'section-why-a-walk-has-two-phases-for-one-energy', afterParagraph: 4,
    title: 'One normalized energy produces two walk phases', plot: 'walk-phases', provenance: 'Analytical illustration',
    assumptions: 'For the Hermitian-involution block construction W = RB derived here, eigenphases are ±arccos(μ), μ = E/λ in [−1,1]. The paired interior branches live in the extended system–ancilla invariant subspace; at endpoints they coincide modulo 2π.',
    takeaway: 'A walk phase is a nonlinear encoding of energy. Do not apply direct-time-evolution decoding to it.',
  },
  {
    id: 'shot-standard-error', lesson: 20, anchor: 'section-means-quantum-variance-and-variance-of-an-estimator', afterParagraph: 1,
    title: 'Four times the shots halves the standard error', plot: 'shots', interaction: 'shots', provenance: 'Analytical illustration',
    assumptions: 'Independent ±1 outcomes with true expectation zero: single-shot variance = 1, standard error of the sample mean = 1/√N. This is not a confidence interval estimated from observed data; noise and covariance are excluded.',
    takeaway: '100, 400, and 1,600 shots give standard errors 0.1, 0.05, and 0.025. Shot count buys precision, not removal of model bias.',
  },
  {
    id: 'group-covariance', lesson: 20, anchor: 'section-grouped-shots-introduce-covariance-the-current-result-omits', afterParagraph: 2,
    title: 'Shared shots can amplify or cancel fluctuations', plot: 'covariance', provenance: 'Analytical illustration',
    assumptions: 'Two zero-mean ±1 variables, unit variances, correlation ρ, N = 100 shared independent shots. Var(mean(X+Y)) = (2+2ρ)/100; Var(mean(X−Y)) = (2−2ρ)/100. Joint probabilities (1±ρ)/4 make every plotted ρ valid.',
    takeaway: 'At perfect positive correlation, the sum variance is 0.04 while the difference variance is zero. Ignoring covariance predicts 0.02 for both.',
  },
  {
    id: 'qpe-finite-bins', lesson: 21, anchor: 'section-standard-qpe-fourier-analysis-of-controlled-powers', afterParagraph: 2,
    title: 'An off-grid eigenphase produces a distribution', plot: 'qpe-bins', interaction: 'qpe-bits', provenance: 'Analytical illustration',
    assumptions: 'Exact ideal coherent standard-QPE probabilities for an eigenstate with phase 0.3 turns. For M = 2ᵐ, Py = |Σx exp(2πix(0.3−y/M))/M|². This is an analytic distribution, not sampling or a nearest-bin guarantee.',
    takeaway: 'More bits narrow the grid but do not make an off-grid phase exactly representable. Finite tails are not necessarily hardware noise.',
  },
  {
    id: 'phase-alias-branches', lesson: 21, anchor: 'section-phase-kickback-in-one-control-qubit', afterParagraph: 2,
    title: 'Phase wraps while the energy coordinate keeps increasing', plot: 'aliases', provenance: 'Analytical illustration',
    assumptions: 'Illustrative positive-sign convention U = exp(+iHt), ℏ = 1. Plot phase = u mod 1 against u = Et/(2π). The descending jumps are drawn as discontinuities, not connecting data. A negative-sign convention reverses the phase orientation.',
    takeaway: 'u = 0.25 and 1.25 yield the same phase. Precision cannot remove this alias without a suitable time/energy window and decoding convention.',
  },
  {
    id: 'coherent-versus-fresh-qpe', lesson: 21, anchor: 'section-fresh-preparation-changes-the-success-story', afterParagraph: 2,
    title: 'Keeping a state across bits is different from preparing it again', diagram: 'fresh-qpe', provenance: 'Conceptual diagram',
    assumptions: 'Contrasts a complete coherent standard-QPE shot with the pinned fresh-system-per-bit implementation described here. The diagram is an execution-scope comparison, not a numerical prediction for every IQPE variant.',
    takeaway: 'A fresh trial superposition can supply different eigencomponents to different bits. Do not transfer a coherent-shot success formula blindly.',
  },
  {
    id: 'amplification-oscillation', lesson: 22, anchor: 'section-amplification-needs-a-precisely-defined-good-subspace', afterParagraph: 3,
    title: 'Amplification overshoots if you keep rotating', plot: 'amplification', provenance: 'Analytical illustration',
    assumptions: 'Ideal exact good-subspace reflections, initial p = 0.1, θ = asin√p, and integer k rounds: pk = sin²((2k+1)θ). No oracle error, phase alias, measurement noise, or gate-cost model.',
    takeaway: 'The success probability oscillates rather than increasing forever. The good-state definition and a stopping strategy matter.',
  },
  {
    id: 'drive-and-time-slices', lesson: 23, anchor: 'section-a-driven-operator-and-the-meaning-of-its-parameters', afterParagraph: 2,
    title: 'A drive changes an operator coefficient, not a state by decree', plot: 'drive', provenance: 'Analytical illustration',
    assumptions: 'Chosen dimensionless f(t) = sin(2πt), with t in arbitrary time units. Dots show samples at Δt = 1/8. H(t) = H₀ + f(t)H₁ still needs an evolution method; this is not a laser pulse or molecular response.',
    takeaway: 'Sampling the drive gives coefficient information at discrete times. It does not itself calculate the evolved state or integration error.',
  },
  {
    id: 'open-periodic-lattice', lesson: 24, anchor: 'section-sites-bonds-and-boundaries', afterParagraph: 2,
    title: 'A boundary choice changes the graph', diagram: 'lattice', provenance: 'Analytical illustration',
    assumptions: 'Six labeled sites. The open chain has five links; the periodic chain adds only the wrap link (5,0). Positions are a drawing layout, not atom coordinates or supplied physical distances.',
    takeaway: 'A periodic graph is finite and is not a periodic electronic-structure calculation with reciprocal-space sampling.',
  },
  {
    id: 'classical-simulation-memory', lesson: 25, anchor: 'section-dense-sparse-and-structured-classical-simulation', afterParagraph: 3,
    title: 'Dense memory grows with the state representation', plot: 'memory', provenance: 'Analytical illustration',
    assumptions: 'Raw complex128 arrays only: pure vector uses 16×2ⁿ bytes; dense density matrix uses 16×4ⁿ bytes. GiB = 2³⁰ bytes. No workspace, indexing, tensor-network/sparse compression, or distributed overhead is included.',
    takeaway: 'A 30-qubit vector and a 15-qubit density matrix both need 16 GiB just for their entries. A sparse input does not ensure sparse evolution.',
  },
  {
    id: 'accuracy-versus-precision', lesson: 26, anchor: 'section-accuracy-precision-resolution-and-uncertainty', afterParagraph: 2,
    title: 'Repeatability can be excellent while the answer is biased', plot: 'accuracy', provenance: 'Synthetic illustration',
    assumptions: 'Chosen deviations from a synthetic reference at zero, in mEh. Tight biased values: 4.9, 5.0, 5.1, 4.95, 5.05. Wider centered values: −1, 0.8, −0.6, 0.4, 0.4. These are illustrative points, not reported chemistry results or confidence intervals.',
    takeaway: 'A narrow spread addresses precision. Agreement with the appropriate reference addresses accuracy; neither is guaranteed by a fine numeric grid.',
  },
  {
    id: 'qpe-whole-query-count', lesson: 27, anchor: 'section-the-complete-qpe-geometric-sum', afterParagraph: 2,
    title: 'The largest controlled power is not the whole shot', plot: 'qpe-work', provenance: 'Analytical illustration',
    assumptions: 'm phase bits, one fixed base U, and Uʳ implemented by r repetitions. Largest component = 2ᵐ⁻¹; complete controlled-power sum = 2ᵐ−1. Excludes preparation, inverse QFT, shots, retries, and compiler resynthesis.',
    takeaway: 'For eight bits, 128 is the largest component while 255 is the full power sum. Further repetitions multiply the complete relevant scope.',
  },
  {
    id: 'conditional-code-distance', lesson: 28, anchor: 'section-distance-threshold-and-the-assumptions-behind-suppression', afterParagraph: 3,
    title: 'Distance helps only under the suppression model’s assumptions', plot: 'logical-error', provenance: 'Analytical illustration',
    assumptions: 'Toy phenomenological pL = 0.1(p/pth)^((d+1)/2) at odd distances, comparing p/pth = 0.1 and 0.5. Conditional logical-failure probability per modeled unit; not a fit to hardware, decoder simulation, or real QRE.',
    takeaway: 'Closer to the modeled threshold, the same distance gives much less suppression. Distance alone says nothing about total runtime, factories, or correlated noise.',
  },
  {
    id: 'resource-pareto-budget', lesson: 29, anchor: 'section-pareto-frontiers-make-the-tradeoff-visible', afterParagraph: 2,
    title: 'A budget selects from a frontier; it does not create a machine', plot: 'pareto', interaction: 'pareto', provenance: 'Lesson teaching example',
    assumptions: 'The section’s explicitly synthetic candidates: A = 200,000 qubits/4 h; B = 400,000/2 h; C = 300,000/5 h; D = 800,000/1 h. Assume the same complete workload and reliability requirement. No estimator was run.',
    takeaway: 'C is dominated by A. A 2.5-hour deadline admits B and D; a qubit ceiling can remove one or both. The frontier covers only these four choices.',
  },
  {
    id: 'transport-artifact-map', lesson: 30, anchor: 'section-7-a-transport-manifest-connects-metadata-to-numerical-files', afterParagraph: 2,
    title: 'A small manifest can point to several kinds of payload', diagram: 'artifacts', provenance: 'Conceptual diagram',
    assumptions: 'The pinned serializer’s supported categories described here: primitive JSON values, typed QDK HDF5 artifacts, and supported non-object NumPy arrays. This is not a universal Python-object serialization promise.',
    takeaway: 'File identity and format are only part of reproducibility. Keep scientific conventions and production history with the artifact relationships.',
  },
  {
    id: 'job-state-lifecycle', lesson: 31, anchor: 'section-5-a-job-record-is-a-durable-lifecycle-record', afterParagraph: 3,
    title: 'Terminal, successful, and retrieved are different states', diagram: 'jobs', provenance: 'Conceptual diagram',
    assumptions: 'Lifecycle abstraction of the Job behavior discussed here. Backend details vary. A wait timeout is not a universal cancel operation; fetching and validating output remain separate steps.',
    takeaway: 'Failure and cancellation are terminal too. An accepted job is not a completed result, and a completed result still needs interpretation.',
  },
  {
    id: 'tool-to-artifact', lesson: 32, anchor: 'section-5-trace-one-tool-call-all-the-way-to-a-saved-result', afterParagraph: 2,
    title: 'A tool call coordinates an existing scientific method', diagram: 'tool-call', provenance: 'Conceptual diagram',
    assumptions: 'Summarizes the described run_scf wrapper: resolve paths, load structure, configure the solver, execute through the common helper, and save/report. Existing-file handling is a separate branch, not proof of newly requested execution.',
    takeaway: 'Track the actual input identity and status envelope. A friendly message or pre-existing filename does not establish a new calculation.',
  },
  {
    id: 'engineering-evidence-layers', lesson: 33, anchor: 'section-9-automated-checks-reduce-avoidable-integration-mistakes', afterParagraph: 3,
    title: 'Different checks support different claims', diagram: 'test-layers', provenance: 'Conceptual diagram',
    assumptions: 'A functional map of formatting/types, numerical invariants, integration tests, and release evidence. It is not a measured coverage chart or a claim that all platforms were tested.',
    takeaway: 'A formatter cannot validate spin conventions. An integration pass does not certify every physical approximation. Match the check to the claim.',
  },
  {
    id: 'whole-workflow-handoffs', lesson: 34, anchor: 'section-11-make-the-partner-team-contracts-explicit', afterParagraph: 1,
    title: 'The review follows artifacts across specialist boundaries', diagram: 'handoffs', provenance: 'Conceptual diagram',
    assumptions: 'Functional responsibilities from the section, not an internal organizational chart or an obligatory sequence of all algorithms. Resource feedback can send the study back to its scientific design.',
    takeaway: 'Chemistry supplies the question and modeled workload; hardware and QEC specialists supply separate assumptions. No single handoff removes the need for the others.',
  },
];

export const figuresForLesson = (number: number) => inlineFigures.filter(figure => figure.lesson === number);
