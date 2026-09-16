import { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import {
  Save,
  Search,
  MapPin,
  Briefcase,
  Tag,
  X,
  Building2,
  Globe,
  Zap,
  Calendar,
  ToggleLeft,
  ToggleRight,
  Loader2,
  Plus,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import {
  useSearchProfiles,
  useCreateSearchProfile,
  useUpdateSearchProfile,
  useDeleteSearchProfile,
  useToggleSearchProfile,
} from "@/api/hooks";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const sectionVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

const sectors = [
  "IT & Tech",
  "Finance",
  "Automobile",
  "Agriculture",
  "BTP",
  "Santé",
  "Éducation",
  "Énergie",
  "Transport",
  "Hôtellerie",
  "Industrie",
  "Commerce",
];

const contractTypes = [
  { id: "cdi", label: "CDI" },
  { id: "cdd", label: "CDD" },
  { id: "stage", label: "Stage" },
  { id: "freelance", label: "Freelance" },
];

const frequencies = [
  { id: "quotidien", label: "Quotidien", icon: Zap },
  { id: "hebdomadaire", label: "Hebdomadaire", icon: Calendar },
  { id: "manuel", label: "Manuel", icon: Search },
];

const platforms = [
  { id: "linkedin", name: "LinkedIn", color: "bg-blue-500" },
  { id: "indeed", name: "Indeed", color: "bg-blue-600" },
  { id: "welcometothejungle", name: "Work in Tech (WTJ)", color: "bg-purple-500" },
  { id: "rekrute", name: "Rekrute", color: "bg-green-500" },
  { id: "manpower", name: "Manpower", color: "bg-red-500" },
];

const cities = [
  "Casablanca",
  "Rabat",
  "Marrakech",
  "Tanger",
  "Fès",
  "Meknès",
  "Agadir",
  "Oujda",
];

function Chip({ label, selected, onClick, onRemove, removable }) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.97 }}
      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-all border ${
        selected
          ? "bg-primary text-primary-foreground border-primary shadow-sm"
          : "bg-muted text-muted-foreground border-border hover:border-primary/40"
      }`}
    >
      {label}
      {removable && selected && (
        <X
          className="w-3 h-3"
          onClick={(e) => {
            e.stopPropagation();
            onRemove?.();
          }}
        />
      )}
    </motion.button>
  );
}

function TagInput({ tags, onAdd, onRemove, placeholder }) {
  const [value, setValue] = useState("");

  const handleKeyDown = (e) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      const trimmed = value.trim();
      if (trimmed && !tags.includes(trimmed)) {
        onAdd(trimmed);
        setValue("");
      }
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-2">
        {tags.map((tag) => (
          <Badge
            key={tag}
            variant="secondary"
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium bg-primary/10 text-primary border-transparent"
          >
            {tag}
            <button
              type="button"
              onClick={() => onRemove(tag)}
              className="text-destructive transition-colors"
            >
              <X className="w-3 h-3" />
            </button>
          </Badge>
        ))}
      </div>
      <Input
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        className="h-auto bg-muted px-4 py-2.5 text-foreground"
      />
    </div>
  );
}

function Toggle({ enabled, onChange, label }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!enabled)}
      className="flex items-center gap-3"
    >
      {enabled ? (
        <ToggleRight className="size-8 text-primary shrink-0" />
      ) : (
        <ToggleLeft className="size-8 text-muted-foreground shrink-0" />
      )}
      {label && (
        <span className="text-sm font-medium text-foreground">
          {label}
        </span>
      )}
    </button>
  );
}

const emptyForm = {
  name: "Développeur Web Senior",
  sectors: ["IT & Tech"],
  keywords: [],
  excludeKeywords: [],
  locations: ["Casablanca"],
  contractTypes: ["cdi"],
  salaryMin: "",
  salaryMax: "",
  frequency: "manuel",
  sourcesConfig: {
    linkedin: { enabled: true, customKeywords: [] },
    indeed: { enabled: true, customKeywords: [] },
    welcometothejungle: { enabled: false, customKeywords: [] },
    rekrute: { enabled: false, customKeywords: [] },
    manpower: { enabled: false, customKeywords: [] },
  },
};

export default function SearchPreferencesPage() {
  const { data: profilesData, isLoading } = useSearchProfiles();
  const createMutation = useCreateSearchProfile();
  const updateMutation = useUpdateSearchProfile();
  const deleteMutation = useDeleteSearchProfile();
  const toggleMutation = useToggleSearchProfile();

  const profiles = useMemo(() => profilesData?.profiles || [], [profilesData]);
  const [selectedId, setSelectedId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [isDirty, setIsDirty] = useState(false);

  useEffect(() => {
    if (profiles.length > 0 && !selectedId) {
      const active = profiles.find((p) => p.isActive) || profiles[0];
      setSelectedId(active._id);
      setForm({
        name: active.name || "",
        sectors: active.sectors || [],
        keywords: active.keywords || [],
        excludeKeywords: active.excludeKeywords || [],
        locations: active.locations || [],
        contractTypes: active.contractTypes || [],
        salaryMin: active.salaryMin?.toString() || "",
        salaryMax: active.salaryMax?.toString() || "",
        frequency: active.frequency || "manuel",
        sourcesConfig: active.sourcesConfig || emptyForm.sourcesConfig,
      });
    }
  }, [profiles, selectedId]);

  const updateField = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setIsDirty(true);
  };

  const toggleArrayItem = (field, item) => {
    setForm((prev) => ({
      ...prev,
      [field]: prev[field].includes(item)
        ? prev[field].filter((i) => i !== item)
        : [...prev[field], item],
    }));
    setIsDirty(true);
  };

  const updateSource = (id, field, value) => {
    setForm((prev) => ({
      ...prev,
      sourcesConfig: {
        ...prev.sourcesConfig,
        [id]: { ...prev.sourcesConfig[id], [field]: value },
      },
    }));
    setIsDirty(true);
  };

  const onSubmit = (e) => {
    e.preventDefault();
    const payload = {
      name: form.name,
      sectors: form.sectors,
      keywords: form.keywords,
      excludeKeywords: form.excludeKeywords,
      locations: form.locations,
      contractTypes: form.contractTypes,
      salaryMin: form.salaryMin ? Number(form.salaryMin) : undefined,
      salaryMax: form.salaryMax ? Number(form.salaryMax) : undefined,
      frequency: form.frequency,
      sourcesConfig: form.sourcesConfig,
    };

    if (selectedId) {
      updateMutation.mutate(
        { id: selectedId, ...payload },
        {
          onSuccess: () => {
            toast.success("Préférences enregistrées !");
            setIsDirty(false);
          },
          onError: () => toast.error("Erreur lors de la sauvegarde"),
        }
      );
    } else {
      createMutation.mutate(payload, {
        onSuccess: (data) => {
          setSelectedId(data.profile._id);
          toast.success("Profil de recherche créé !");
          setIsDirty(false);
        },
        onError: () => toast.error("Erreur lors de la création"),
      });
    }
  };

  const handleNew = () => {
    setSelectedId(null);
    setForm(emptyForm);
    setIsDirty(false);
  };

  const handleDelete = () => {
    if (!selectedId) return;
    deleteMutation.mutate(selectedId, {
      onSuccess: () => {
        setSelectedId(null);
        setForm(emptyForm);
        toast.success("Profil supprimé");
      },
      onError: () => toast.error("Erreur lors de la suppression"),
    });
  };

  const handleToggle = () => {
    if (!selectedId) return;
    toggleMutation.mutate(selectedId, {
      onSuccess: () => toast.success("Statut mis à jour"),
      onError: () => toast.error("Erreur"),
    });
  };

  const isSaving = createMutation.isPending || updateMutation.isPending;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-muted dark:bg-background pb-24">
        <div className="max-w-3xl mx-auto px-4 py-8">
          <div className="space-y-6">
            {[1, 2].map((i) => (
              <div key={i} className="h-64 animate-pulse rounded-xl bg-muted" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted dark:bg-background pb-24">
      <div className="max-w-3xl mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-foreground">
            Préférences de recherche
          </h1>
          <p className="text-muted-foreground mt-1">
            Configurez vos profils de recherche d'emploi
          </p>
        </motion.div>

        {profiles.length > 0 && (
          <motion.div variants={sectionVariants} initial="hidden" animate="visible" className="mb-6">
            <div className="flex items-center gap-2 overflow-x-auto pb-2">
              {profiles.map((p) => (
                <Button
                  key={p._id}
                  variant={selectedId === p._id ? "default" : "secondary"}
                  onClick={() => {
                    setSelectedId(p._id);
                    setForm({
                      name: p.name || "",
                      sectors: p.sectors || [],
                      keywords: p.keywords || [],
                      excludeKeywords: p.excludeKeywords || [],
                      locations: p.locations || [],
                      contractTypes: p.contractTypes || [],
                      salaryMin: p.salaryMin?.toString() || "",
                      salaryMax: p.salaryMax?.toString() || "",
                      frequency: p.frequency || "manuel",
                      sourcesConfig: p.sourcesConfig || emptyForm.sourcesConfig,
                    });
                    setIsDirty(false);
                  }}
                  className={`flex items-center gap-2 px-4 py-2 text-sm font-medium whitespace-nowrap transition-all ${
                    selectedId === p._id
                      ? "shadow-[var(--shadow-md)]"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {p.name}
                  {p.isActive && (
                    <span className="w-2 h-2 rounded-full bg-green-400" />
                  )}
                </Button>
              ))}
              <Button
                variant="secondary"
                onClick={handleNew}
                className="flex items-center gap-1 px-4 py-2 text-sm font-medium whitespace-nowrap text-muted-foreground hover:text-foreground transition-all"
              >
                <Plus className="w-4 h-4" /> Nouveau
              </Button>
            </div>
          </motion.div>
        )}

        <form onSubmit={onSubmit} className="space-y-6">
          <motion.div
            variants={sectionVariants}
            initial="hidden"
            animate="visible"
            className="bg-card rounded-xl p-6 shadow-sm border border-border"
          >
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Search className="w-5 h-5 text-primary" />
              </div>
              <h2 className="text-lg font-semibold text-foreground">
                Profil de recherche
              </h2>
            </div>

            <div className="space-y-1.5 mb-6">
              <Label className="text-foreground">
                Nom du profil
              </Label>
              <Input
                type="text"
                value={form.name}
                onChange={(e) => updateField("name", e.target.value)}
                className="h-auto bg-muted px-4 py-2.5 text-foreground"
              />
            </div>

            <div className="space-y-2 mb-6">
              <div className="flex items-center gap-2 mb-2">
                <Building2 className="w-4 h-4 text-muted-foreground" />
                <label className="text-sm font-medium text-foreground">
                  Secteurs ciblés
                </label>
              </div>
              <div className="flex flex-wrap gap-2">
                {sectors.map((sector) => (
                  <Chip
                    key={sector}
                    label={sector}
                    selected={form.sectors.includes(sector)}
                    onClick={() => toggleArrayItem("sectors", sector)}
                  />
                ))}
              </div>
            </div>

            <div className="space-y-2 mb-6">
              <div className="flex items-center gap-2 mb-2">
                <Tag className="w-4 h-4 text-muted-foreground" />
                <label className="text-sm font-medium text-foreground">
                  Mots-clés
                </label>
              </div>
              <TagInput
                tags={form.keywords}
                onAdd={(tag) => updateField("keywords", [...form.keywords, tag])}
                onRemove={(tag) => updateField("keywords", form.keywords.filter((k) => k !== tag))}
                placeholder="Ajouter un mot-clé..."
              />
            </div>

            <div className="space-y-2 mb-6">
              <div className="flex items-center gap-2 mb-2">
                <X className="w-4 h-4 text-muted-foreground" />
                <label className="text-sm font-medium text-foreground">
                  Mots-clés exclus
                </label>
              </div>
              <TagInput
                tags={form.excludeKeywords}
                onAdd={(tag) => updateField("excludeKeywords", [...form.excludeKeywords, tag])}
                onRemove={(tag) => updateField("excludeKeywords", form.excludeKeywords.filter((k) => k !== tag))}
                placeholder="Ajouter un mot-clé à exclure..."
              />
            </div>

            <div className="space-y-2 mb-6">
              <div className="flex items-center gap-2 mb-2">
                <MapPin className="w-4 h-4 text-muted-foreground" />
                <label className="text-sm font-medium text-foreground">
                  Localisations
                </label>
              </div>
              <div className="flex flex-wrap gap-2">
                {cities.map((city) => (
                  <Chip
                    key={city}
                    label={city}
                    selected={form.locations.includes(city)}
                    onClick={() => toggleArrayItem("locations", city)}
                  />
                ))}
              </div>
            </div>

            <div className="space-y-2 mb-6">
              <div className="flex items-center gap-2 mb-2">
                <Briefcase className="w-4 h-4 text-muted-foreground" />
                <label className="text-sm font-medium text-foreground">
                  Types de contrat
                </label>
              </div>
              <div className="flex flex-wrap gap-3">
                {contractTypes.map((ct) => (
                  <label
                    key={ct.id}
                    className="flex items-center gap-2.5 cursor-pointer group"
                  >
                    <div
                      className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all ${
                        form.contractTypes.includes(ct.id)
                          ? "bg-primary border-primary"
                          : "border-border group-hover:border-primary/40"
                      }`}
                    >
                      {form.contractTypes.includes(ct.id) && (
                        <svg className="w-3 h-3 text-primary-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </div>
                    <span className="text-sm font-medium text-foreground">
                      {ct.label}
                    </span>
                    <input
                      type="checkbox"
                      className="sr-only"
                      checked={form.contractTypes.includes(ct.id)}
                      onChange={() => toggleArrayItem("contractTypes", ct.id)}
                    />
                  </label>
                ))}
              </div>
            </div>

            <div className="space-y-2 mb-6">
              <Label className="text-foreground">
                Fourchette de salaire (MAD)
              </Label>
              <div className="grid grid-cols-2 gap-4">
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">Min</span>
                  <Input
                    type="number"
                    value={form.salaryMin}
                    onChange={(e) => updateField("salaryMin", e.target.value)}
                    placeholder="5000"
                    className="h-auto pl-12 pr-4 py-2.5 bg-muted text-foreground"
                  />
                </div>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">Max</span>
                  <Input
                    type="number"
                    value={form.salaryMax}
                    onChange={(e) => updateField("salaryMax", e.target.value)}
                    placeholder="25000"
                    className="h-auto pl-12 pr-4 py-2.5 bg-muted text-foreground"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-foreground">
                Fréquence de scrapping
              </Label>
              <div className="grid grid-cols-3 gap-3">
                {frequencies.map((freq) => (
                  <button
                    key={freq.id}
                    type="button"
                    onClick={() => updateField("frequency", freq.id)}
                    className={`p-3 rounded-lg border text-center transition-all ${
                      form.frequency === freq.id
                        ? "bg-primary/10 border-primary shadow-sm"
                        : "bg-muted border-border hover:border-primary/40"
                    }`}
                  >
                    <freq.icon
                      className={`size-5 mx-auto mb-1 ${
                        form.frequency === freq.id ? "text-primary" : "text-muted-foreground"
                      }`}
                    />
                    <span className={`text-sm font-medium ${
                      form.frequency === freq.id
                        ? "text-primary"
                        : "text-foreground"
                    }`}>
                      {freq.label}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </motion.div>

          <motion.div
            variants={sectionVariants}
            initial="hidden"
            animate="visible"
            className="bg-card rounded-xl p-6 shadow-sm border border-border"
          >
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center">
                <Globe className="w-5 h-5 text-accent" />
              </div>
              <h2 className="text-lg font-semibold text-foreground">
                Sources
              </h2>
            </div>

            <div className="space-y-4">
              {platforms.map((platform) => (
                <div
                  key={platform.id}
                  className="p-4 rounded-lg bg-muted border border-border"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className={`w-3 h-3 rounded-full ${platform.color}`} />
                      <span className="font-medium text-foreground text-sm">
                        {platform.name}
                      </span>
                    </div>
                    <Toggle
                      enabled={form.sourcesConfig[platform.id]?.enabled || false}
                      onChange={(val) => updateSource(platform.id, "enabled", val)}
                    />
                  </div>
                  {form.sourcesConfig[platform.id]?.enabled && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                    >
                      <TagInput
                        tags={form.sourcesConfig[platform.id]?.customKeywords || []}
                        onAdd={(tag) => {
                          const current = form.sourcesConfig[platform.id]?.customKeywords || [];
                          updateSource(platform.id, "customKeywords", [...current, tag]);
                        }}
                        onRemove={(tag) => {
                          const current = form.sourcesConfig[platform.id]?.customKeywords || [];
                          updateSource(platform.id, "customKeywords", current.filter((k) => k !== tag));
                        }}
                        placeholder={`Mots-clés custom pour ${platform.name}...`}
                      />
                    </motion.div>
                  )}
                </div>
              ))}
            </div>
          </motion.div>

          <div className="sticky bottom-0 py-4 bg-muted/80 dark:bg-background/80 backdrop-blur-xl -mx-4 px-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              {selectedId && (
                <>
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={handleToggle}
                    className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground"
                  >
                    {profiles.find((p) => p._id === selectedId)?.isActive ? "Désactiver" : "Activer"}
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={handleDelete}
                    disabled={deleteMutation.isPending}
                    className="px-4 py-2 text-sm font-medium text-destructive transition-colors disabled:opacity-50 hover:bg-transparent"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </>
              )}
            </div>
            <Button
              type="submit"
              disabled={isSaving || !isDirty}
              className="px-8 py-3 font-semibold rounded-lg shadow-sm flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSaving ? (
                <Loader2 className="size-5 animate-spin" />
              ) : (
                <Save className="size-5" />
              )}
              {selectedId ? "Enregistrer les modifications" : "Créer le profil"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}