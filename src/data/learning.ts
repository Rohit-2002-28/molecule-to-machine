export type LabKind = 'active' | 'mixing' | 'interference' | 'shots' | 'grouping' | 'phase' | 'budget' | 'resources' | 'handoff';
export type PlateKind = 'bond' | 'orbitals' | 'contracts' | 'basis' | 'loop' | 'stability' | 'potential' | 'rotation' | 'configurations' | 'partition' | 'refinement' | 'factorization' | 'circuit' | 'parity' | 'sector' | 'overlap' | 'decomposition' | 'product' | 'block' | 'measurement' | 'phase' | 'amplification' | 'driven' | 'lattice' | 'execution' | 'budget' | 'workload' | 'patch' | 'pareto' | 'provenance' | 'remote' | 'interfaces' | 'layers' | 'review';
export interface Question { prompt: string; choices: string[]; correct: number; explanation: string }
export interface Learning {
  idea: string;
  summary: string;
  plate: { kind: PlateKind; title: string; caption: string; labels: [string, string, string] };
  lab: LabKind;
  labContext: string;
  handoff: { recipient: string; artifact: string; boundary: string };
  questions: Question[];
}
const q = (prompt: string, choices: string[], correct: number, explanation: string): Question => ({ prompt, choices, correct, explanation });
const plate = (kind: PlateKind, title: string, caption: string, labels: [string, string, string]): Learning['plate'] => ({ kind, title, caption, labels });

export const learning: Record<number, Learning> = {
  1: {
    idea: 'A quantum workflow starts with a testable chemical question.',
    summary: 'Separate the system, the approximation, and the required accuracy before selecting an algorithm.',
    plate: plate('bond', 'One geometry is one question', 'A schematic nitrogen pair at a specified separation. Choosing a distance defines one point on an energy curve, not the entire bond-breaking process. The drawing is not to scale.', ['Specify nuclei and charge', 'Hold a chosen separation R', 'Request energy with an accuracy target']),
    lab: 'budget', labContext: 'Try allocating a scientific error allowance before committing it all to the quantum solver.',
    handoff: { recipient: 'Electronic-structure and algorithm specialists', artifact: 'System, geometry, charge, spin, target property, and an explicit error target.', boundary: 'A molecular example is not a demonstrated industrial process or quantum advantage.' },
    questions: [
      q('What makes “understand bond breaking” into a calculable first question?', ['Choose the longest quantum circuit available.', 'Specify the geometry, electronic model, target energy, and acceptable error.', 'Count physical qubits before defining the molecule.'], 1, 'The physical system, model, observable, and accuracy form the calculation contract. Algorithm and hardware choices come after it.'),
      q('What does a very precise solver result establish by itself?', ['The chemical model is accurate enough.', 'The calculation proves a quantum advantage.', 'The selected model was solved precisely; model error still needs assessment.'], 2, 'A solver can be very accurate for an inadequate basis, active space, or physical approximation. Precision does not eliminate model error.'),
      q('How should the two resource-estimation interfaces be understood?', ['Alternative consumers of a described application workload.', 'Two compulsory consecutive stages.', 'Chemistry routines that discover hardware error rates.'], 0, 'Circuit.estimate() and get_qre_application() support different estimation routes. External models provide the hardware and error-correction assumptions.'),
    ],
  },
  2: {
    idea: 'Orbitals describe one-electron building blocks; a wavefunction describes the joint state.',
    summary: 'Build from basis functions to orbitals, occupations, determinants, and coherent combinations.',
    plate: plate('orbitals', 'From available modes to a joint state', 'Each spatial orbital has two spin modes. Occupation records choose modes; antisymmetrized determinants and their coefficients describe a many-electron state. Arrows are spin labels, not electron trajectories.', ['One spatial orbital, two spin modes', 'At most one electron per spin mode', 'Combine determinants with amplitudes']),
    lab: 'mixing', labContext: 'See how off-diagonal coupling can lower the energy of a two-determinant model.',
    handoff: { recipient: 'Classical solvers and state-preparation routines', artifact: 'An orbital basis, a Hamiltonian, occupations, and a well-defined many-electron state.', boundary: 'Orbital pictures and probability densities do not supply all the phases of a wavefunction.' },
    questions: [
      q('Why can two electrons occupy the same spatial orbital?', ['They occupy different spin orbitals.', 'The exclusion principle only applies on quantum hardware.', 'Their spatial coordinates must be identical.'], 0, 'The Pauli restriction is one electron per spin orbital. A spatial orbital has distinct alpha and beta spin modes.'),
      q('Why are configuration probabilities alone insufficient to describe a pure state?', ['Probabilities determine every relative phase.', 'Relative signs and phases affect interference and energy.', 'Configurations are always classical trajectories.'], 1, 'Two amplitude vectors can have the same absolute squares but different relative phases, producing different interference and Hamiltonian expectation values.'),
      q('What is the distinction between HF and CI in the lesson?', ['HF measures circuits; CI compiles them.', 'Both only change the number of nuclei.', 'HF optimizes a determinant through its orbitals; CI optimizes combinations of determinants.'], 2, 'The distinction is between orbital optimization and many-electron coefficient optimization. Multiconfigurational orbital optimization is another layer.'),
    ],
  },
  3: {
    idea: 'Scientific objects cross typed software contracts.',
    summary: 'Separate the scientific model, algorithm family, concrete implementation, and settings.',
    plate: plate('contracts', 'The object is the handoff', 'A molecular model enters an electronic solver, which returns an energy and state for the next consumer. Algorithm selection does not erase each object’s scientific meaning.', ['Input: molecule and representation', 'Tool: registered family + implementation', 'Output: energy and wavefunction']),
    lab: 'handoff', labContext: 'Inspect the minimum information another team needs to interpret a result.',
    handoff: { recipient: 'Algorithm implementers and plugin authors', artifact: 'Typed inputs, output capabilities, settings, and explicit failures.', boundary: 'A common API is not evidence that two backends use identical numerical methods.' },
    questions: [
      q('What does selecting an implementation from a registry resolve?', ['Which concrete tool will fulfill an algorithm-family contract.', 'Whether the molecule is scientifically important.', 'Every numerical setting automatically.'], 0, 'The registry selects an implementation. The physical model and typed settings are still separate choices.'),
      q('Why should settings be typed instead of an unrestricted dictionary?', ['To prevent any user configuration.', 'To hide backend errors.', 'To validate supported controls and expose configuration mistakes.'], 2, 'Typed settings make the contract inspectable and invalid controls actionable rather than silently accepted.'),
      q('What must a plugin preserve when implementing the same algorithm family?', ['The exact runtime of every other implementation.', 'The scientific meaning and capabilities of the input/output contract.', 'Only the class name.'], 1, 'Interoperability depends on scientific semantics and supported data capabilities, not just matching a name or function signature.'),
    ],
  },
  4: {
    idea: 'Geometry, units, charge, spin, and basis define the representation.',
    summary: 'A molecule is more than an XYZ picture, and a basis is more than a size label.',
    plate: plate('basis', 'A basis is a vocabulary of shapes', 'Schematic functions centered on nuclei combine into molecular orbitals. More functions increase representational flexibility but can introduce near-linear dependence. These lobes are illustrative, not calculated orbitals.', ['Centers and units define geometry', 'Functions span an orbital space', 'Overlap affects numerical conditioning']),
    lab: 'active', labContext: 'Count modes and occupations after choosing a spatial-orbital space; a count alone does not assess basis quality.',
    handoff: { recipient: 'Integral and electronic-structure solvers', artifact: 'Geometry with units, nuclear charges, electron/spin counts, basis definitions, and any ECP.', boundary: 'An effective core potential changes the modeled Hamiltonian; it is not simply a prettier basis.' },
    questions: [
      q('Why must geometry units travel with coordinates?', ['Coordinates determine units uniquely.', 'The same numbers in different length units describe different systems.', 'Units matter only when drawing the molecule.'], 1, 'Distances affect integrals and energies. Numeric coordinates without their unit convention are an incomplete physical input.'),
      q('What can go wrong when basis functions become nearly linearly dependent?', ['The overlap problem can become ill-conditioned.', 'Electrons lose their charge.', 'All correlations become exact automatically.'], 0, 'Redundant functions make the overlap matrix close to singular and complicate stable numerical solutions.'),
      q('What is distinct about an ECP?', ['It is only a change in file format.', 'It changes isotope mass but never electronic interactions.', 'It replaces part of the core-electron description with an effective interaction.'], 2, 'An effective core potential is a model choice about the electronic Hamiltonian, distinct from merely changing the orbital expansion.'),
    ],
  },
  5: {
    idea: 'The mean field depends on the orbitals that it determines.',
    summary: 'Follow the SCF feedback loop without confusing orbital energies with total energy.',
    plate: plate('loop', 'Self-consistency is a feedback loop', 'Start from a density, build the effective one-electron operator, solve for orbitals, and update the density. Stop according to the chosen convergence criteria, not because the diagram reaches its final box.', ['Density builds the mean field', 'Orbitals produce a new density', 'Compare residuals and energy changes']),
    lab: 'mixing', labContext: 'Contrast diagonal energies with the eigenvalues of a coupled problem; this is not an SCF simulation.',
    handoff: { recipient: 'Correlation, stability, and active-space workflows', artifact: 'Converged orbitals, electron counts, energy conventions, and the actual convergence settings.', boundary: 'A converged mean-field state is not automatically stable or sufficiently correlated.' },
    questions: [
      q('Why is self-consistent field iterative?', ['The effective operator depends on a density built from its solution.', 'Quantum computers cannot accept matrices.', 'Nuclei must change position every iteration.'], 0, 'The orbitals define the density and the density defines the mean field. The iteration seeks consistency between them.'),
      q('Why is total HF energy not just the sum of occupied orbital energies?', ['Orbital energies have no units.', 'The sum includes no electronic interactions.', 'Interaction contributions require the correct double-counting treatment and constants.'], 2, 'Orbital eigenvalues include mean-field interactions. Summing them without the energy expression counts interactions incorrectly and omits required constants.'),
      q('What changes between HF and Kohn-Sham DFT?', ['Only the file extension.', 'The energy model, including exchange-correlation treatment.', 'The number of protons in each nucleus.'], 1, 'Kohn-Sham DFT uses a different functional construction and exchange-correlation approximation; sharing an SCF loop does not make it HF.'),
    ],
  },
  6: {
    idea: 'Convergence and stability answer different questions.',
    summary: 'Use residuals, history-based acceleration, and curvature diagnostics deliberately.',
    plate: plate('stability', 'Small steps do not prove a minimum', 'A low iteration residual can identify a stationary point. Positive or negative curvature along an allowed orbital rotation tells a different story about local stability. The curves are schematic.', ['Convergence: residual approaches zero', 'Stable direction: energy rises', 'Unstable direction: energy falls']),
    lab: 'mixing', labContext: 'Explore how an additional allowed coupling changes the lowest energy, rather than treating a stopped iteration as the final truth.',
    handoff: { recipient: 'Scientific reviewers and downstream model builders', artifact: 'Starting guess, tolerances, residuals, stability checks, and any perturb-and-resolve history.', boundary: 'A convergence flag is not a guarantee of the globally best state or chemical accuracy.' },
    questions: [
      q('What does an orbital stability analysis test beyond convergence?', ['Whether every physical qubit is error-corrected.', 'Energy curvature along permitted orbital changes.', 'Whether the output filename is unique.'], 1, 'A stationary solution may be a saddle point. Stability examines whether a permitted perturbation can lower the energy.'),
      q('What is the role of DIIS?', ['Use a history of residuals to improve the iterative solution.', 'Change nuclear charges until the solver stops.', 'Prove that a basis is complete.'], 0, 'DIIS extrapolates using previous errors. It accelerates convergence but does not independently validate the scientific model.'),
      q('After finding an unstable mean-field state, what is a meaningful next action?', ['Simply print more decimal places.', 'Declare all quantum algorithms invalid.', 'Perturb along a relevant direction, solve again, and record what changed.'], 2, 'The lesson distinguishes diagnosing instability from carrying out a controlled perturb-and-resolve workflow.'),
    ],
  },
  7: {
    idea: 'An energy, a derivative, and an atomic population are different outputs.',
    summary: 'Keep the geometry attached to derivatives and the population convention attached to charges.',
    plate: plate('potential', 'A slope asks how the nuclei could move', 'The energy curve is illustrative. A gradient at one geometry describes a local slope; optimizing moves to a different geometry and therefore asks a different question from a fixed-geometry benchmark.', ['Energy belongs to a geometry', 'Gradient measures a local slope', 'Optimization changes the geometry']),
    lab: 'budget', labContext: 'Consider derivative and finite-difference approximations as additional error sources, not just more precise energy labels.',
    handoff: { recipient: 'Geometry optimizers and chemistry interpretation', artifact: 'Energy/gradient/Hessian with geometry and units, plus the population-analysis convention.', boundary: 'Population-derived atomic charges are convention-dependent partitions of shared density.' },
    questions: [
      q('What happens to a fixed-geometry benchmark when the nuclei are optimized?', ['It remains exactly the same scientific question.', 'It becomes a physical resource estimate.', 'The geometry and question change; report it as a separate comparison.'], 2, 'Relaxed and fixed-geometry energies can both be useful, but they are not interchangeable benchmark conditions.'),
      q('Why can different atomic population schemes report different charges?', ['They partition a shared density using different conventions.', 'Nuclear charge is random.', 'The electron count has no meaning.'], 0, 'Atomic populations are derived assignments, not a unique direct decomposition of the molecular density.'),
      q('What is a cost of finite-difference derivatives?', ['They never need an energy solver.', 'They need multiple displaced calculations and a step-size error tradeoff.', 'They always remove electronic convergence error.'], 1, 'Finite differences are general but require repeated calculations, and truncation and numerical error must be balanced.'),
    ],
  },
  8: {
    idea: 'An orbital rotation can preserve a space while changing its usefulness.',
    summary: 'Distinguish canonical, localized, natural, and quantum-information orbital objectives.',
    plate: plate('rotation', 'Change the coordinates, not the whole space', 'Two orthonormal axes are rotated within the same span. With a consistent full-space transformation, the physics is unchanged; truncating after the rotation can change the model.', ['Canonical: diagonalize a mean field', 'Localized: optimize a spatial criterion', 'Natural: diagonalize a density matrix']),
    lab: 'mixing', labContext: 'Watch eigenstate weights change as a small Hamiltonian changes; natural-orbital occupations are a different density-matrix construction.',
    handoff: { recipient: 'Active-space selectors and Hamiltonian builders', artifact: 'Transformed orbitals with their ordering, gauge, objective, and consistent transformed quantities.', boundary: 'A localized orbital is not an observable electron trajectory, and natural orbitals need density provenance.' },
    questions: [
      q('What defines natural orbitals?', ['They are always the most spatially compact orbitals.', 'They diagonalize the chosen one-particle density matrix.', 'They are chosen by nuclear mass alone.'], 1, 'Natural orbitals diagonalize a density matrix. The state and approximation used to obtain that density must be specified.'),
      q('When can changing orbital coordinates change the result?', ['Whenever the names of orbitals change.', 'Never, even after discarding modes.', 'When a subsequent truncation or approximation depends on that choice.'], 2, 'A complete consistent transformation preserves the space, but selecting a subset in the new basis is a new modeling decision.'),
      q('What is essential when interpreting localized-orbital output?', ['Its optimization objective and return contract.', 'Only the image color.', 'A claim that each electron has been assigned a permanent location.'], 0, 'Localization methods optimize different criteria and their APIs return specific data. Neither implies labeled electron trajectories.'),
    ],
  },
  9: {
    idea: 'Correlation requires a joint many-electron coefficient problem.',
    summary: 'Compare full, active-space, and selected determinant problems without conflating their reductions.',
    plate: plate('configurations', 'A sparse graph in configuration space', 'Illustrative occupation strings are nodes; Hamiltonian couplings connect allowed changes. CI solves for amplitudes over a chosen determinant space. This is not a solved nitrogen wavefunction.', ['Each row is an occupation pattern', 'Couplings connect configurations', 'Coefficients define the joint state']),
    lab: 'active', labContext: 'See the combinatorial determinant growth that motivates smaller active spaces and selected CI.',
    handoff: { recipient: 'Reduced-density, orbital, and quantum-state workflows', artifact: 'Coefficients and determinant ordering in a defined orbital basis and electron sector.', boundary: 'A Wavefunction container does not imply every expensive RDM or entropy quantity is available.' },
    questions: [
      q('What is the key difference between CASCI and selecting a determinant subset?', ['CASCI retains the complete chosen active-space problem; selected CI truncates determinants.', 'CASCI changes protons into electrons.', 'Selected CI always means all determinants of the full basis.'], 0, 'Active-orbital reduction and determinant selection are distinct approximations and should be reported separately.'),
      q('Why are reduced density matrices useful?', ['They always reconstruct every amplitude uniquely.', 'They eliminate every need for an orbital basis.', 'They retain the information required by certain few-body observables.'], 2, 'A one- or two-particle RDM supports corresponding observables without storing or exposing all wavefunction information.'),
      q('If a Hamiltonian is mapped to qubits and then diagonalized on a CPU, what was performed?', ['A fault-tolerant quantum calculation.', 'A classical calculation in a qubit representation.', 'A measurement of a physical quantum processor.'], 1, 'Changing representation is distinct from changing the computing device or solver.'),
    ],
  },
  10: {
    idea: 'Active-space selection is a scientific approximation, not a free compression.',
    summary: 'Track active, frozen, and excluded modes together with the evidence used to select them.',
    plate: plate('partition', 'Three orbital roles, one consistent model', 'Inactive occupations contribute constants and effective interactions, active modes remain explicit, and excluded modes are not treated as freely correlated active electrons. Positions are illustrative.', ['Inactive: fixed occupation', 'Active: explicit many-electron problem', 'Excluded: outside the chosen model']),
    lab: 'active', labContext: 'Vary active orbitals and electron/spin counts. Qubit savings do not quantify chemical error.',
    handoff: { recipient: 'Hamiltonian construction and algorithm planning', artifact: 'Active indices, frozen occupations, orbital ordering, selection criterion, and reference evidence.', boundary: 'An entropy or occupation ranking does not automatically prove that the reduced model meets an energy target.' },
    questions: [
      q('What happens to frozen-core contributions?', ['They always disappear from every energy expression.', 'They remain in appropriate constants and effective active-space terms.', 'They become extra measurement shots.'], 1, 'Freezing occupancy removes explicit degrees of freedom, not their entire contribution to the active Hamiltonian and energy accounting.'),
      q('What must accompany natural occupation or entropy criteria?', ['Only an attractive orbital plot.', 'A hardware device name.', 'The state, orbitals, and approximation from which the diagnostic was derived.'], 2, 'Selection diagnostics are not context-free numbers; their provenance determines what they mean.'),
      q('How should an active-space reduction be assessed?', ['Compare scientific quantities and approximation effects, not only qubit count.', 'Assume fewer qubits implies higher accuracy.', 'Ignore inactive electrons.'], 0, 'A smaller representation is useful only in relation to the scientific objective and acceptable approximation error.'),
    ],
  },
  11: {
    idea: 'Optimizing orbitals, adding correlation, and downfolding are different operations.',
    summary: 'Keep implemented solvers separate from interfaces that describe a future or external capability.',
    plate: plate('refinement', 'Three distinct refinement routes', 'MCSCF changes the orbitals for a multiconfigurational state; dynamical correlation treats additional effects; an effective-Hamiltonian route changes the reduced operator. The dashed branch denotes an interface rather than a supplied solver.', ['MCSCF: orbitals and coefficients', 'Correlation: effects beyond a reference', 'Downfolding: an effective operator']),
    lab: 'mixing', labContext: 'The toy mixes only two configurations. It cannot reproduce MP2, CCSD, MCSCF, or a downfolding method.',
    handoff: { recipient: 'Correlated solvers and representation tools', artifact: 'Reference state, matching Hamiltonian, supported amplitudes/densities, and method-specific assumptions.', boundary: 'Coupled-cluster amplitudes are not automatically a normalized state vector ready for a quantum loader.' },
    questions: [
      q('What does MCSCF optimize beyond fixed-orbital CI?', ['Only measurement grouping.', 'Only a hardware clock rate.', 'The orbitals as well as the multiconfigurational state.'], 2, 'Orbital adaptation for a correlated state is the additional optimization; it is not the same as simply enlarging a determinant list.'),
      q('Why are CC amplitudes not a ready-made pure-state vector?', ['They parameterize an exponential excitation construction with additional interpretation required.', 'They never contain useful chemistry information.', 'All amplitudes are probabilities.'], 0, 'A coupled-cluster parameterization and its left-state information are not interchangeable with normalized CI coefficients.'),
      q('What should an effective-Hamiltonian interface without a provided solver be called?', ['A complete production downfolding calculation.', 'A capability contract, not evidence of an implemented solver.', 'A proof that no downfolding method can exist.'], 1, 'The source boundary matters: an interface declares a contract, while an actual algorithm must implement it.'),
    ],
  },
  12: {
    idea: 'Changing storage or factorization is not the same as changing the chemical question.',
    summary: 'Track indexing, constants, low-rank approximations, and their own error allowance.',
    plate: plate('factorization', 'A tensor can have a structured representation', 'The square is a schematic pair-index view of a two-electron tensor. Factors encode structure; truncation changes the representation approximately. Fetching a dense tensor can undo the storage saving.', ['Dense: pair-index tensor', 'Factors: structured components', 'Truncation: a separate error source']),
    lab: 'budget', labContext: 'Allocate factorization error separately from model and final estimation error.',
    handoff: { recipient: 'Qubit mapping and block-encoding builders', artifact: 'Integral conventions, spin blocks, offsets, factorization data, and truncation semantics.', boundary: 'A block-encoding normalization is not a new molecular energy.' },
    questions: [
      q('What must be retained when converting Hamiltonian storage?', ['Index conventions, spin structure, constants, and approximation settings.', 'Only a matrix shape.', 'Only the total file size.'], 0, 'Two arrays can have the same shape but different scientific semantics. Operators and energy constants must remain consistent.'),
      q('Why can a getter be unexpectedly expensive?', ['Reading a factor always requires quantum hardware.', 'Accessing a number changes nuclear geometry.', 'It may materialize a large dense object from compact factors.'], 2, 'A common facade can hide very different storage and reconstruction costs; use the representation-specific access path deliberately.'),
      q('Where does factorization truncation belong in an error analysis?', ['Nowhere, because representation changes are always exact.', 'In its own approximation allowance, distinct from the chemical model and sampling.', 'Only in the physical hardware failure probability.'], 1, 'Approximate compression can perturb the operator. Its error is not identical to basis error, measurement noise, or fault-tolerance failure.'),
    ],
  },
  13: {
    idea: 'A relative phase becomes observable through interference.',
    summary: 'Understand amplitudes, gates, entanglement, ancillas, and sampling before counting qubits.',
    plate: plate('circuit', 'H, phase, H: turn a phase into a probability', 'An ideal qubit starts in zero. A Hadamard creates a superposition, a phase gate changes relative phase, and a second Hadamard recombines the paths. The probabilities depend on that phase.', ['Prepare a coherent superposition', 'Change a relative phase', 'Recombine before measuring']),
    lab: 'interference', labContext: 'Change the phase and see exact ideal probabilities for this one-qubit circuit.',
    handoff: { recipient: 'Circuit construction and execution', artifact: 'Register ordering, gates and controls, ancilla initialization/cleanup, and readout conventions.', boundary: 'A measurement produces a sample, not direct access to the full amplitude vector.' },
    questions: [
      q('Why does a second Hadamard reveal a relative phase?', ['It labels the electron that was moving fastest.', 'It interferes amplitudes before measurement.', 'It reads every complex amplitude directly.'], 1, 'Relative phases affect how amplitudes add or cancel. Measurement probabilities after recombination expose that effect.'),
      q('What does one computational-basis measurement return?', ['One sampled outcome according to the state probabilities.', 'The full state vector.', 'A guaranteed molecular ground energy.'], 0, 'A shot is a sample. Estimating probabilities or observables requires many shots or a different classical simulation capability.'),
      q('Why must workspace ancillas be cleaned up for reversible composition?', ['To make all gates classical.', 'To force every amplitude positive.', 'Residual entanglement can change the intended operation on the system.'], 2, 'Ancillas are part of the joint state. Leaving unintended information in them can break composition and controlled/adjoint use.'),
    ],
  },
  14: {
    idea: 'Encoding fermions must preserve their signs and operator algebra.',
    summary: 'Map states and operators in the same ordering; a qubit does not always directly store one occupation.',
    plate: plate('parity', 'The preceding occupations determine a sign', 'A Jordan-Wigner-style string tracks parity before a target mode. In the illustrated 1,0,1,0 occupation, removing the mode-2 electron crosses one occupied earlier mode and contributes a minus sign. Mode order here increases left to right.', ['Modes: 0, 1, 2, 3', 'Preceding occupation count: 1', 'Fermionic sign: minus']),
    lab: 'grouping', labContext: 'Explore the Pauli language used after mapping; grouping is downstream of a correctly encoded operator.',
    handoff: { recipient: 'Symmetry reduction and quantum algorithms', artifact: 'Mapped operator, matching encoded state, mapping table, mode ordering, and constants.', boundary: 'A custom mapping table is not automatically valid merely because an API accepts it.' },
    questions: [
      q('What does a Jordan-Wigner parity string preserve?', ['The color of an orbital plot.', 'A hardware location for each nucleus.', 'The fermionic sign associated with operator ordering.'], 2, 'Fermionic anticommutation requires parity-dependent signs; omitting them changes matrix elements and interference.'),
      q('What must agree between a prepared state and mapped Hamiltonian?', ['Encoding and orbital/qubit ordering.', 'Only their file extensions.', 'Only the number of printed decimal places.'], 0, 'An operator acting on the wrong encoded basis is not the intended scientific calculation, even when array dimensions match.'),
      q('Does every fermion-to-qubit encoding store a mode occupation directly on the same-index qubit?', ['Yes, by definition.', 'No; parity and Bravyi-Kitaev encode information differently.', 'Only when there are no electrons.'], 1, 'Different mappings distribute occupation and parity information differently. State construction and decoding must honor the chosen mapping.'),
    ],
  },
  15: {
    idea: 'A smaller symmetry sector must still contain the state you mean.',
    summary: 'Distinguish spin-block structure from qubit tapering and retain the chosen eigenvalue sector.',
    plate: plate('sector', 'A symmetry partitions a space', 'For the toy operator Z tensor Z, the basis states 00 and 11 have eigenvalue +1; 01 and 10 have eigenvalue -1. Selecting a sector removes possibilities only when it matches the target problem.', ['Even parity: 00 and 11', 'Odd parity: 01 and 10', 'Carry the selected sector downstream']),
    lab: 'active', labContext: 'Compare all fixed-electron determinants with a fixed spin-projection sector. This count is not a qubit-tapering algorithm.',
    handoff: { recipient: 'State loaders, estimators, and resource accounting', artifact: 'Symmetry generators, selected eigenvalues, transformed operator, and consistently transformed state.', boundary: 'Removing qubits in the wrong sector can give a precise answer to the wrong problem.' },
    questions: [
      q('What is essential when using a symmetry to reduce a register?', ['Always choose the numerically smallest sector label.', 'Identify and preserve the sector containing the intended state.', 'Discard all state-preparation information.'], 1, 'The operator may preserve several sectors. The physical problem determines which one should be represented.'),
      q('Why are spin-block storage and qubit tapering not the same thing?', ['They concern different structural/API operations, even if both exploit symmetry.', 'Spin blocks are always a hardware error code.', 'Tapering only renames array files.'], 0, 'Classical spin-block structure and transformed qubit symmetries have distinct contracts and reductions.'),
      q('What should accompany a tapered Hamiltonian?', ['Only the lower qubit count.', 'A new nuclear geometry chosen silently.', 'The sector and the matching state/observable transformations.'], 2, 'The reduced representation is meaningful only when all consumers agree about the transformation and retained physical sector.'),
    ],
  },
  16: {
    idea: 'The state you can load may not be the eigenstate you want.',
    summary: 'Track overlap, normalization, encoding, and the complete cost of loading and uncomputing.',
    plate: plate('overlap', 'Overlap sets a success weight', 'A schematic trial state has components along several energy eigenstates. Phase estimation samples their eigenphases with weights given by squared overlaps, rather than selecting the lowest energy automatically.', ['Trial state: a coherent combination', 'Target overlap: a squared amplitude', 'Loader cost includes its workspace']),
    lab: 'mixing', labContext: 'Interpret the first-basis-state weight in a two-state eigenvector as an overlap in this toy model.',
    handoff: { recipient: 'QPE, overlap tests, and amplification', artifact: 'Normalized coefficients or supported loader data in the correct encoding, plus overlap and cost assumptions.', boundary: 'Reproducing the same marginal probabilities is not necessarily preparing the same pure state.' },
    questions: [
      q('Why does ground-state overlap matter to phase estimation?', ['It determines which basis-file format can be used.', 'It removes the need for controlled evolution.', 'Its squared magnitude sets the target-eigenstate outcome weight.'], 2, 'QPE does not know which state is the ground state; it resolves eigenphases present in the input superposition.'),
      q('What can be lost when small CI coefficients are discarded?', ['Normalization and target-state quality unless checked and handled.', 'The nuclear proton count.', 'Every possible hardware error.'], 0, 'Truncation changes the trial state. Renormalization alone does not prove that overlap or scientific quality is preserved.'),
      q('Why is matching a probability distribution not always enough?', ['All phases are physically irrelevant.', 'Relative phases and entanglement with workspace can change the pure state.', 'Sampling is identical to coherent state preparation.'], 1, 'A loader must implement the intended coherent state, not merely reproduce computational-basis frequencies.'),
    ],
  },
  17: {
    idea: 'A mathematical operation becomes a circuit through several explicit contracts.',
    summary: 'Track controls, adjoints, register layout, representations, and supported conversions.',
    plate: plate('decomposition', 'Compile the meaning of a Pauli rotation', 'A schematic Pauli exponential changes basis, computes a parity, rotates, and reverses those steps. Adding controls requires consistent phase handling; a global phase can become a relative phase.', ['Change to a useful basis', 'Compute parity and rotate', 'Uncompute and restore the basis']),
    lab: 'interference', labContext: 'Observe why a relative phase matters before composing a controlled operation.',
    handoff: { recipient: 'QDK/compiler and interoperability consumers', artifact: 'Unitary plan, registers, control/adjoint capabilities, supported circuit representations, and target profile.', boundary: 'A Circuit wrapper does not guarantee an arbitrary conversion between every framework.' },
    questions: [
      q('Why can global-phase bookkeeping matter when controlling an operation?', ['A controlled global phase becomes a relative phase between branches.', 'All controlled operations are classical.', 'Qubit order disappears under control.'], 0, 'The control branch that applies the operation picks up the phase while the other does not, so interference can detect it.'),
      q('Why reverse a parity-computation network after a rotation?', ['To change the scientific target.', 'To increase every measurement variance.', 'To remove workspace information while retaining the intended unitary action.'], 2, 'Uncomputation restores ancillas or parity work so later operations see the correct coherent register.'),
      q('What should be checked before requesting a framework conversion?', ['Whether the code has enough comments.', 'Whether that representation and conversion path are actually supported.', 'Whether every simulator has the same random seed.'], 1, 'A shared wrapper organizes capabilities; it is not a promise that every possible cross-framework conversion is implemented.'),
    ],
  },
  18: {
    idea: 'Noncommuting terms make time evolution an approximation problem.',
    summary: 'Compare deterministic and randomized constructions using explicit accuracy and cost assumptions.',
    plate: plate('product', 'Alternating pieces approximate a joint evolution', 'A first-order product alternates A and B pieces. When they do not commute, this differs from exponentiating their sum; repeating smaller steps changes both approximation error and circuit cost.', ['Target: evolution under A + B', 'Product: ordered A then B pieces', 'Refinement: more, smaller steps']),
    lab: 'grouping', labContext: 'Test commutation as one prerequisite for reasoning about grouped evolution terms; qubit-wise grouping is stricter than global commutation.',
    handoff: { recipient: 'Phase estimation and dynamics routines', artifact: 'Evolution sign/time convention, term representation, approximation method, and validated error allowance.', boundary: 'An error helper or leading-remainder estimate is not a universal rigorous accuracy guarantee.' },
    questions: [
      q('When is exp(A + B) generally different from exp(A) exp(B)?', ['Only when the matrices have different filenames.', 'When A and B do not commute.', 'Never for a Hamiltonian.'], 1, 'Noncommuting operators introduce order-dependent corrections. Product formulas approximate rather than simply rewrite the exact exponential.'),
      q('What is traded when using more product-formula steps?', ['Usually lower discretization error against more operations.', 'Fewer orbitals against more protons.', 'A guaranteed quantum advantage against a lower shot count.'], 0, 'Accuracy and cost must be evaluated for the chosen formula, Hamiltonian, time, and regime.'),
      q('What is distinctive about qDRIFT?', ['It solves the full molecular wavefunction classically.', 'It always uses every term equally often in each realization.', 'It samples Hamiltonian terms according to a coefficient-dependent scheme.'], 2, 'The randomized term selection is part of the approximation method; its guarantees and variance are not those of a fixed Trotter sequence.'),
    ],
  },
  19: {
    idea: 'A Hamiltonian can be encoded as part of a larger unitary.',
    summary: 'Keep normalization, ancilla preparation, walk phases, and generator cost explicit.',
    plate: plate('block', 'The useful operator occupies a block', 'The normalized Hamiltonian appears within an ancilla-selected block of a larger unitary. The surrounding entries make the whole operation unitary; they are not discarded chemistry terms.', ['Normalize by a specified scale', 'Select the ancilla block', 'Interpret walk phases with its spectral map']),
    lab: 'phase', labContext: 'Explore phase discretization and aliases; a walk needs its own energy-to-phase decoding, not this direct-evolution rule.',
    handoff: { recipient: 'Quantum-walk phase estimation', artifact: 'Normalization, PREPARE/SELECT data, workspace contract, and the correct energy-phase relationship.', boundary: 'A walk phase is not automatically a directly evolved energy phase.' },
    questions: [
      q('What does block encoding mean?', ['Every matrix element is measured directly once.', 'The Hamiltonian must itself be unitary.', 'A normalized operator appears in a selected block of a larger unitary.'], 2, 'The unitary acts on system plus ancillas; projecting the appropriate ancilla block exposes the encoded operator.'),
      q('Why keep the normalization scale?', ['It is needed to interpret encoded eigenvalues and algorithm cost.', 'It is an extra nuclear energy by definition.', 'It only chooses a plot color.'], 0, 'Normalization controls the relation between the Hamiltonian and the unitary construction, and affects query complexity.'),
      q('Why can walk-based phase estimation need branch information?', ['All walks have zero phase.', 'The walk can associate multiple phases with one energy through a nonlinear spectral map.', 'The basis contains no spin orbitals.'], 1, 'The decoding is specific to the construction. It must not be confused with a simple direct time-evolution phase.'),
    ],
  },
  20: {
    idea: 'Energy estimation combines samples, coefficients, and statistical assumptions.',
    summary: 'Separate observable variance from estimator variance and account for grouped-shot covariance.',
    plate: plate('measurement', 'One setting can inform several terms', 'Qubit-wise compatible Z terms can share a measurement setting, while X terms need another basis. Shared shots can correlate term estimates; counting settings alone does not determine uncertainty.', ['Choose a compatible basis', 'Collect finite samples', 'Combine means and covariance correctly']),
    lab: 'shots', labContext: 'Explore the standard error for one independently sampled Pauli observable; this model does not include grouped-term covariance.',
    handoff: { recipient: 'Scientific validation', artifact: 'Observable coefficients, basis groups, actual shot allocation, estimator conventions, offsets, and uncertainty.', boundary: 'More shots reduce sampling uncertainty, not systematic model or state-preparation error.' },
    questions: [
      q('For independent shots of one observable, what happens to standard error when shots quadruple?', ['It halves.', 'It always becomes zero.', 'It quadruples.'], 0, 'The ideal standard error scales as one over the square root of the sample count when the distribution is fixed.'),
      q('Why can a grouped-energy uncertainty require covariance?', ['Grouping changes the nuclear charge.', 'Every Pauli term becomes identical.', 'Several term estimates come from the same shots and can be correlated.'], 2, 'The variance of a weighted sum includes covariance terms. Ignoring them is not justified merely because the means are available.'),
      q('Are globally commuting terms always measurable in one product basis without entangling basis changes?', ['Yes, by definition.', 'No; qubit-wise commutation is a stricter condition.', 'Only if all coefficients are positive.'], 1, 'For example, XX and ZZ commute globally but not qubit-wise. The measurement implementation must support the required basis construction.'),
    ],
  },
  21: {
    idea: 'Phase estimation reads a periodic phase, not an unambiguous energy label.',
    summary: 'Carry evolution conventions, energy windows, trial overlap, and the full repetition schedule.',
    plate: plate('phase', 'A finite grid on a circle', 'Eight bins represent a three-bit phase grid. Phase wraps modulo one, so different energies can share a phase unless the evolution time and prior energy interval resolve the ambiguity.', ['Bits set the phase grid', 'Evolution time sets the energy scale', 'Prior bounds resolve aliases']),
    lab: 'phase', labContext: 'Change bits, evolution time, and energy to see resolution improve without removing modulo ambiguity.',
    handoff: { recipient: 'Scientific decoding and logical-work accounting', artifact: 'Phase convention, evolution/walk mapping, energy window, offsets, preparation strategy, and all queries/repetitions.', boundary: 'A favorable trial overlap and finite-resolution output do not guarantee the ground energy on every run.' },
    questions: [
      q('What does adding phase bits directly improve?', ['The chemical basis-set completeness.', 'Resolution of the phase grid.', 'Physical gate fidelity automatically.'], 1, 'More readout precision refines the phase grid, but does not remove model error, aliases, or poor trial overlap.'),
      q('Why is a prior energy range useful?', ['The measured phase is periodic, so several energies may decode to the same phase.', 'It makes all eigenstates identical.', 'It removes the need for a Hamiltonian.'], 0, 'An appropriate time and prior interval support unambiguous decoding within the intended spectral region.'),
      q('Why can estimating only the largest QPE circuit undercount a procedure?', ['The largest circuit always includes every other run for free.', 'QPE never repeats preparation.', 'Other bits, preparations, shots, and trials still contribute work.'], 2, 'A component estimate is useful when labeled, but complete procedure cost needs every circuit and repetition.'),
    ],
  },
  22: {
    idea: 'Amplification needs a correctly defined good subspace and an expensive oracle.',
    summary: 'Overlap tests, finite-resolution tagging, and reflection costs are separate pieces.',
    plate: plate('amplification', 'Rotate toward a specified subspace', 'In the ideal two-dimensional amplitude-amplification picture, reflections rotate weight between good and bad subspaces. “Good” is defined by the oracle, not automatically by ground-state status.', ['Define the good-state predicate', 'Reflect about the required subspaces', 'Count oracle and inverse costs']),
    lab: 'interference', labContext: 'Use interference as a small intuition-builder; this single-qubit circuit is not a full amplitude-amplification implementation.',
    handoff: { recipient: 'Algorithm and resource reviewers', artifact: 'Oracle predicate, approximation/alias behavior, success assumptions, reflections, and full repeated cost.', boundary: 'The shipped energy-threshold oracle’s direction must be read from its implementation, not inferred from its name.' },
    questions: [
      q('What determines which states amplitude amplification favors?', ['Whatever has the smallest numeric energy automatically.', 'The chosen filename.', 'The implemented good-subspace predicate.'], 2, 'Amplification boosts the marked subspace. If the predicate has the wrong sense or finite-resolution errors, it boosts the wrong outcomes.'),
      q('What can a Hadamard test estimate?', ['A real or imaginary component of a suitable complex expectation/overlap.', 'All state amplitudes from a single shot.', 'The full physical machine size without assumptions.'], 0, 'The controlled operation and measurement basis determine the accessible component, with statistical uncertainty from samples.'),
      q('Why count more than the number of amplification rounds?', ['Every reflection is always free.', 'The oracle, preparation, inverses, and controls can dominate each round.', 'Round count has no relationship to work.'], 1, 'A round is a composite operation. Fair cost accounting expands its expensive subroutines.'),
    ],
  },
  23: {
    idea: 'When the Hamiltonian changes, the order of time matters.',
    summary: 'Treat drive parameters, time integration, observation schedules, and sampling separately.',
    plate: plate('driven', 'A time-dependent operator is an ordered story', 'A schematic drive changes across successive intervals. The propagator composes time-ordered operations; observing several times can require several prefix evolutions rather than a free movie of one run.', ['Specify H(t) and drive units', 'Approximate ordered intervals', 'Measure an explicit observation schedule']),
    lab: 'budget', labContext: 'Reserve allowances for time integration and sampling separately; the budget is illustrative and has no automatic error certification.',
    handoff: { recipient: 'Dynamics interpretation and execution planning', artifact: 'Initial state, time-dependent operator, time units, integrator settings, requested observables, and time points.', boundary: 'An Euler-named builder can be a staged exponential integrator, not the textbook scalar Euler update.' },
    questions: [
      q('Why can chronological order matter for a driven Hamiltonian?', ['Operators at different times may not commute.', 'Time units cancel every interaction.', 'All time dependence is a plotting effect.'], 0, 'Time ordering is necessary when the instantaneous operators do not commute, motivating controlled approximations to the propagator.'),
      q('What should be checked before interpreting a calculated time series?', ['Only its line color.', 'That every time point was produced with no extra work.', 'Which evolutions and measurements were actually performed for each time point.'], 2, 'Repeated prefix evolutions and separate observable measurements can make a time series far more expensive than a single endpoint.'),
      q('What error sources are distinct in driven simulation?', ['Only the final print rounding matters.', 'Physical model, integration, circuit approximation, and finite sampling.', 'Geometry filenames and display font.'], 1, 'Different layers require different evidence and cannot all be fixed by taking more measurement shots.'),
    ],
  },
  24: {
    idea: 'A lattice model is a deliberate model, not automatically first-principles chemistry.',
    summary: 'State the sites, bonds, boundary conditions, parameters, and output representation.',
    plate: plate('lattice', 'Sites, hopping, and local interactions', 'A four-site schematic separates links that permit hopping from a local double-occupation interaction. Boundary conditions and supplied parameters define the model; the drawing alone does not determine them.', ['Sites define the degrees of freedom', 'Bonds carry hopping/coupling terms', 'Interactions need explicit parameters']),
    lab: 'active', labContext: 'Count a fixed-occupation space for a small spinful site model, while keeping model assumptions separate from count.',
    handoff: { recipient: 'Classical or quantum model solvers', artifact: 'Topology, boundaries, hopping/interactions, occupation sector, and fermionic or direct-spin output.', boundary: 'A spin Ising model and a fermionic molecular Hamiltonian have different physical meanings.' },
    questions: [
      q('What must be supplied beyond a lattice drawing?', ['Only the number of pixels.', 'Boundary conditions, parameters, degrees of freedom, and the physical model.', 'A claim that all molecular integrals were computed.'], 1, 'Topology alone is not a Hamiltonian. Couplings, interactions, occupations, and conventions define the calculation.'),
      q('What is the Hubbard-model competition emphasized here?', ['Hopping between sites versus the cost of local double occupation.', 'Nuclear mass versus screen resolution.', 'Readout bits versus file compression.'], 0, 'Kinetic hopping and local interactions can favor qualitatively different many-body behavior.'),
      q('What does a large circuit-study example establish by itself?', ['An exact large statevector simulation.', 'First-principles accuracy for a real material.', 'The circuit construction or resource scope actually carried out.'], 2, 'Constructing or counting a large circuit is not equivalent to simulating its full quantum state or validating a material model.'),
    ],
  },
  25: {
    idea: 'Executing, simulating, sampling, and estimating resources are different computations.',
    summary: 'Match representations, profiles, noise models, and result conventions to the consumer.',
    plate: plate('execution', 'One circuit, different questions for a consumer', 'The same circuit description can be sent to ideal simulation, a supported noise-aware executor, or a resource consumer. These return different evidence; one route does not establish the output of another.', ['Ideal simulation: mathematical behavior', 'Noisy sampling: a specified noise model', 'Counting: demand, not scientific output']),
    lab: 'shots', labContext: 'Study ideal independent sampling uncertainty. Device noise and biased preparation are deliberately absent from this model.',
    handoff: { recipient: 'Execution backends and framework adapters', artifact: 'Supported circuit form, profile, qubit ordering, readout, seed/shot settings, noise assumptions, and dependencies.', boundary: 'A simulator seed supports repeatability in its environment, not physical accuracy or identical behavior across frameworks.' },
    questions: [
      q('What does an ideal simulator omit unless modeled explicitly?', ['All linear algebra.', 'The circuit description.', 'Device noise and other hardware imperfections.'], 2, 'An ideal simulator evaluates a mathematical circuit. Realistic noise needs an explicit model and an implementation that supports it.'),
      q('Why inspect bitstring and readout conventions?', ['Ordering, omitted bits, and normalization affect interpretation of results.', 'Bitstrings always label nuclei directly.', 'Every framework necessarily uses the same convention.'], 0, 'Data with correct dimensions can still be misinterpreted if bit order and readout semantics do not match.'),
      q('What is OpenFermion interoperability in this context?', ['A guarantee of live quantum hardware execution.', 'A route for operator representations and related transformations.', 'A replacement for chemical validation.'], 1, 'Interoperability boundaries are capability-specific. Operator exchange is not a promise of hardware execution.'),
    ],
  },
  26: {
    idea: 'A precise number needs an auditable chain of meaning.',
    summary: 'Check constants, representation, trial quality, resolution, uncertainty, and chemical interpretation.',
    plate: plate('budget', 'Accuracy is built from different allowances', 'The bars represent separate illustrative error allowances, not measured errors. A conservative bound can sum valid component bounds; a root-sum-square combination needs justified statistical assumptions.', ['Model and representation error', 'Algorithm and state error', 'Sampling and decoding uncertainty']),
    lab: 'budget', labContext: 'Build a conservative sum of illustrative bounds; compare it with a scientific target rather than a hardware failure probability.',
    handoff: { recipient: 'Scientific reviewers and resource-estimation teams', artifact: 'An acceptance record tying the result to model, units, offsets, reference, error budget, and complete procedure.', boundary: 'Resolution, precision, accuracy, and uncertainty are distinct, and a regression reference is not a universal scientific guarantee.' },
    questions: [
      q('Why are energy offsets important when comparing results?', ['They only make numbers shorter.', 'Different representations may include constants in different places.', 'They are always physical hardware failure probabilities.'], 1, 'Nuclear and frozen-core constants must be accounted for exactly once in a consistent comparison.'),
      q('When is a root-sum-square uncertainty combination justified?', ['When the required statistical assumptions, such as independence, are supported.', 'Whenever a smaller number looks better.', 'For every systematic model error by default.'], 0, 'Statistical combination rules need a valid probabilistic model. Systematic bounds cannot automatically be combined that way.'),
      q('What can more measurement shots fix in isolation?', ['An insufficient chemical basis.', 'An incorrect energy offset.', 'Sampling uncertainty under the same distribution, not systematic bias.'], 2, 'Additional samples reduce finite-shot noise but do not repair an incorrect model, encoding, state, or decoder.'),
    ],
  },
  27: {
    idea: 'Count the procedure, not only its largest circuit.',
    summary: 'Include preparations, controlled powers, shots, trials, workspace, and the scope of each count.',
    plate: plate('workload', 'A workload is an accounting ledger', 'For identical repeated experiments, counts multiply; for different circuits, sum each cost times its repetitions. Peak simultaneous allocation and circuit depth require different accounting from total gate count.', ['List every circuit scope', 'Multiply by actual repetitions', 'Track peak width separately']),
    lab: 'handoff', labContext: 'Check whether a workload record carries the scientific and representation context required for a meaningful cost study.',
    handoff: { recipient: 'Compiler, fault-tolerance, and estimation specialists', artifact: 'Complete logical work, peak live allocation, operation categories, precision, success/repetition policy, and excluded costs.', boundary: 'A declared Circuit argument width can omit scratch and differ from counted peak allocation.' },
    questions: [
      q('How should serial circuit workloads be combined?', ['Sum gate work with repetitions, but assess peak live width rather than summing every width.', 'Add widths and ignore shot counts.', 'Use only the largest circuit and call it the entire campaign.'], 0, 'Operation work accumulates across runs. Serially reused qubits need peak simultaneous allocation accounting, not a sum of register widths.'),
      q('What assumption is needed before counting controlled powers as a geometric sum of base-U calls?', ['Every unitary must have zero cost.', 'The hardware error rate must be unknown.', 'The same U and a consistent repeated-application construction must actually be used.'], 2, 'Resynthesis, direct time scaling, and different constructions can change the accounting unit. A formula must match the implementation.'),
      q('Why retain state-preparation and success assumptions in the ledger?', ['Preparation cost is always negligible.', 'Trial quality and repeated attempts can materially change total work.', 'Only the final measurement bit has a cost.'], 1, 'A complete experiment includes preparation and a justified repetition policy; success formulas need the relevant independence and scope assumptions.'),
    ],
  },
  28: {
    idea: 'An error-corrected machine is a model with a reliability target.',
    summary: 'Connect logical demand to physical operations, syndrome extraction, decoding, and factory throughput.',
    plate: plate('patch', 'One logical qubit is not one physical qubit', 'The grid is a schematic encoding, not a real device layout or a specific code. Error-corrected execution needs physical operations, repeated checks, decoding, and other resources beyond data patches.', ['Protect encoded information', 'Measure syndromes, not the logical state', 'Budget non-Clifford supply and failures']),
    lab: 'resources', labContext: 'Explore only a declared patch-scaling formula. The missing factory and reliability models are central to real estimates.',
    handoff: { recipient: 'QEC, hardware, and resource-estimation specialists', artifact: 'Complete logical workload plus code, physical operation errors/times, reliability target, decoder and factory assumptions.', boundary: 'A modeled code threshold, hardware primitive, or error rate is not measured device evidence or a delivery timeline.' },
    questions: [
      q('What do syndrome measurements seek to learn?', ['Every amplitude of the protected logical state.', 'Information about correctable errors without directly reading out the logical information.', 'The molecular geometry automatically.'], 1, 'Error correction measures stabilizer or check information designed to reveal error syndromes while preserving encoded quantum information.'),
      q('Why can magic-state factories matter to total cost?', ['Their footprint, throughput, and failure behavior support non-Clifford demand.', 'They remove all need for physical qubits.', 'They are classical copies of arbitrary unknown quantum states.'], 0, 'Fault-tolerant non-Clifford supply can dominate space or time. Counting data patches alone omits that supply chain.'),
      q('What does choosing a larger code distance guarantee by itself?', ['A precise physical runtime and hardware price.', 'That all correlated noise and leakage are eliminated.', 'No complete guarantee; suppression depends on the code, noise, schedule, and decoding assumptions.'], 2, 'Distance is an important code parameter, but reliability is conditional on a valid model and its regime.'),
    ],
  },
  29: {
    idea: 'A resource estimate is a conditional engineering statement.',
    summary: 'Keep the two estimator routes, their result schemas, and the assumptions behind a frontier distinct.',
    plate: plate('pareto', 'A frontier contains tradeoffs, not a promise', 'Synthetic candidates illustrate a time-versus-physical-qubits frontier. A dominated point is worse in both coordinates. A frontier is only over the candidates actually generated and evaluated.', ['Match the scientific workload', 'Declare hardware and QEC assumptions', 'Compare nondominated candidates']),
    lab: 'resources', labContext: 'This stripped-down calculator demonstrates why a logical count needs assumptions. It is not either QDK estimator interface.',
    handoff: { recipient: 'Application, compiler, QEC, and hardware reviewers', artifact: 'Input workload, estimator route/version, model settings, error budget, candidate search, failures, and full result scope.', boundary: 'Disabling one pruning step does not establish completeness over every possible architecture or schedule.' },
    questions: [
      q('How are Circuit.estimate() and get_qre_application() related?', ['They are two compulsory sequential stages with identical schemas.', 'They are the same method under two spellings.', 'They are alternative interfaces with different model, query, and result contracts.'], 2, 'The convenience estimator route and direct qdk.qre route must be configured and interpreted according to their actual APIs.'),
      q('What makes one candidate Pareto-dominated for qubit count and runtime?', ['Another candidate is no worse in either measure and better in at least one.', 'It uses a different color in a plot.', 'It has any nonzero error budget.'], 0, 'Pareto comparison exposes multi-objective tradeoffs. It does not certify model validity or that the search covered all possibilities.'),
      q('What is necessary for a fair comparison of two chemistry algorithms?', ['Only compare their smallest returned qubit number.', 'Match the scientific question, accuracy, success criteria, complete workload scope, and machine assumptions.', 'Use whichever component estimate is cheapest.'], 1, 'Changing the model or excluding work can make an apparent cost improvement answer a different question.'),
    ],
  },
  30: {
    idea: 'A saved object and a reproducible experiment are not the same artifact.',
    summary: 'Preserve numerical conventions, schemas, provenance, and the limits of each exchange format.',
    plate: plate('provenance', 'Identity connects the artifact to its story', 'Inputs, method settings, and serialized outputs need a traceable relationship. A schema supports interpretation; a content identity supports reuse; neither alone certifies scientific correctness.', ['Record array and unit conventions', 'Separate schema and package versions', 'Preserve provenance beyond the object']),
    lab: 'handoff', labContext: 'Inspect which pieces are missing from a hypothetical saved-result record.',
    handoff: { recipient: 'Reproducers, collaborators, and cache consumers', artifact: 'Versioned data and method/input provenance, units, ordering, hashes with scope, and a transport manifest.', boundary: 'A native cache hash is not automatically a portable archival identity; a cube picture is not the original orbital function.' },
    questions: [
      q('What does successful deserialization establish?', ['The stored object can be reconstructed under that schema, not that the full experiment is reproducible.', 'The numerical result is scientifically correct.', 'Every input and external dependency was preserved.'], 0, 'Object round trips and complete experiment provenance are related but distinct. A valid file can lack crucial scientific context.'),
      q('Why separate schema version from package version?', ['They must always have the same number.', 'Schemas only describe plot colors.', 'The data-format contract and software release identity track different kinds of change.'], 2, 'Compatibility and migration depend on actual schema rules, not a guessed equivalence with a package release number.'),
      q('What is a content hash useful for in this workflow?', ['Proving chemical accuracy.', 'Identifying content for supported cache/reuse semantics.', 'Recovering all missing units from a number.'], 1, 'Identity checks do not add provenance or scientific truth, and build-dependent native hashes have limited portability.'),
    ],
  },
  31: {
    idea: 'Placement, lifecycle, and reuse are separate engineering choices.',
    summary: 'Follow jobs and cached artifacts without mistaking remote chemistry work for quantum hardware execution.',
    plate: plate('remote', 'A job handle is not a finished result', 'A client submits a portable request to a backend, tracks its lifecycle, and retrieves an artifact. Reusing a cache entry is a separate decision governed by identity and validity.', ['Submit a serializable request', 'Track status and explicit failures', 'Retrieve or reuse the right artifact']),
    lab: 'handoff', labContext: 'Check what another process needs to interpret and safely reuse an output.',
    handoff: { recipient: 'Execution backends and scientific clients', artifact: 'Portable inputs, installed capability assumptions, job identity/status, result locations, cache scope, and provenance.', boundary: 'A local subprocess is still local classical execution; a timeout does not universally cancel a remote job.' },
    questions: [
      q('What does an asynchronous submission usually return first?', ['A guaranteed validated scientific result.', 'A job handle for tracking submitted work.', 'A physical quantum processor.'], 1, 'A handle represents a lifecycle. Submission, successful execution, retrieval, and scientific validation are different stages.'),
      q('Why is cache reuse different from remote execution?', ['Reuse avoids repeated work when identity/validity match; execution placement chooses where work happens.', 'They are always the same backend setting.', 'A shared-cache flag creates a network deployment.'], 0, 'A cache and a backend solve different problems. Neither automatically supplies connectivity, authorization, or exactly-once execution.'),
      q('What is safe to infer from a client wait timeout?', ['The remote task was certainly cancelled.', 'Every output was deleted.', 'The wait ended; cancellation and remote lifecycle depend on the backend contract.'], 2, 'Client-side timing and remote job control are separate. Inspect the actual lifecycle before resubmitting or cleaning up.'),
    ],
  },
  32: {
    idea: 'An interface makes scientific work accessible, not automatically valid.',
    summary: 'Trace CLI, MCP, and visualization actions to real inputs, status envelopes, and saved artifacts.',
    plate: plate('interfaces', 'Several front doors, the same scientific obligations', 'Human and agent interfaces expose related capabilities through different input and output contracts. A friendly response, existing file, or rendered circuit is not proof of a newly completed calculation.', ['Discover supported operations', 'Bind the intended workspace', 'Interpret the actual result status']),
    lab: 'handoff', labContext: 'Test the information an assistant should preserve when describing a result to a person.',
    handoff: { recipient: 'Scientists, tool clients, and agent integrators', artifact: 'Intended workspace, discovered operation/schema, actual inputs, result status, provenance, and explicit side effects.', boundary: 'MCP transport or an installable guidance skill does not add scientific authority, authentication, or execution capability by itself.' },
    questions: [
      q('What is the difference between an assistant explanation and an executed calculation?', ['There is none if the explanation sounds confident.', 'Both automatically create validated artifacts.', 'Execution needs evidence of the actual operation, inputs, status, and result artifacts.'], 2, 'The lesson separates presentation from capability and evidence. A response should preserve, not conceal, those boundaries.'),
      q('What should a client do before choosing tool settings?', ['Discover the supported operations and schemas in the actual interface.', 'Invent settings from a remembered method name.', 'Assume a guidance skill adds every possible server tool.'], 0, 'Capability discovery and the current API contract prevent unsupported calls and stale assumptions.'),
      q('Why is an existing output file insufficient proof of a requested computation?', ['Files never contain scientific information.', 'It may predate the request or correspond to different inputs and settings.', 'Only screenshots are valid evidence.'], 1, 'Artifact identity, overwrite/reuse behavior, and status need interpretation rather than inferring success from existence.'),
    ],
  },
  33: {
    idea: 'Scientific correctness crosses language, build, test, and release boundaries.',
    summary: 'Treat numerical dependencies and supported configurations as part of a trustworthy scientific handoff.',
    plate: plate('layers', 'The method depends on the stack around it', 'Native data and numerical libraries, bindings, Python workflows, and delivery infrastructure have different responsibilities. A correct method needs consistent conventions across every layer.', ['Numerical and data contracts', 'Bindings and supported capabilities', 'Reproducible build and release evidence']),
    lab: 'handoff', labContext: 'Inspect a record before handing a scientific package or artifact to another environment.',
    handoff: { recipient: 'Package maintainers, integrators, and researchers', artifact: 'Tested source revision, dependency/build configuration, platform support, numerical regression evidence, and release/docs metadata.', boundary: 'A passing CI job is evidence for its tested configuration, not proof of every scientific claim or every platform.' },
    questions: [
      q('Why can a binding-layer bug become a scientific bug?', ['Bindings only choose font styles.', 'A changed tensor convention or dtype can change the interpreted calculation.', 'Native and Python data never cross a boundary.'], 1, 'Shapes, ordering, units, ownership, and capabilities are scientific as well as software contracts.'),
      q('What does a build option represent?', ['A configuration-dependent capability, not a universal promise for every installed package.', 'Proof that all optional dependencies are present everywhere.', 'A guarantee of the same runtime on all platforms.'], 0, 'The actual build and dependency configuration determine which implementations are available and supported.'),
      q('What should tests cover beyond syntax and import success?', ['Only the length of documentation files.', 'No numerical behavior, because it can vary.', 'Scientific invariants, representation conventions, numerical tolerances, and supported integration paths.'], 2, 'Software correctness and scientific interpretation meet at those contracts; tests need to exercise them explicitly.'),
    ],
  },
  34: {
    idea: 'The final deliverable is an argument supported by artifacts.',
    summary: 'Review the complete question-to-machine chain and state exactly what its evidence does not establish.',
    plate: plate('review', 'Every claim needs a supporting record', 'The scientific question, reduced model, numerical evidence, and conditional machine study must refer to the same intended task. Review gates expose assumptions; they do not certify results merely by being checked.', ['Preserve the original question', 'Reconcile results and error ledgers', 'Review complete work and partner assumptions']),
    lab: 'handoff', labContext: 'Use the checklist as a prompt for the final review, never as an automatic scientific approval.',
    handoff: { recipient: 'The complete scientific and engineering review', artifact: 'A connected evidence package from physical question through representations, results, whole-workload accounting, conditional resources, and reproducibility.', boundary: 'A useful demonstration or modeled estimate is not automatically practical advantage, hardware readiness, or commercial value.' },
    questions: [
      q('What is the strongest final deliverable?', ['A single impressive energy number.', 'A circuit image without settings.', 'A traceable argument connecting the question, assumptions, artifacts, validation, and full scope.'], 2, 'The review tests whether each transformation and conclusion is supported, rather than treating one number as the whole result.'),
      q('What should happen if a cheaper workflow changes the active model or target state?', ['Make the changed question explicit and revalidate the comparison.', 'Treat it as an unconditional improvement.', 'Hide the change in a source-code comment.'], 0, 'Fair scientific and resource comparisons need matched objectives or a transparent account of what changed.'),
      q('What belongs in a final go/no-go review?', ['Only whether a UI says complete.', 'Evidence gaps, error budgets, reproducibility, complete costs, and the limits of every claim.', 'A guaranteed hardware delivery date inferred from qubit count.'], 1, 'The course ends by connecting scientific adequacy and engineering evidence while retaining uncertainty and ownership boundaries.'),
    ],
  },
};
