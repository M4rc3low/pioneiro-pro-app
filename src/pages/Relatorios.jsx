import { useState, useEffect } from "react";
import { pioneiroApi } from "@/api/pioneiroClient";
import { FileText, Copy, CheckCircle2, Pencil, X, Save, Clock, RotateCcw, BookMarked, BookOpen, Video } from "lucide-react";
import { toast } from "sonner";
import { getMesNome, getUltimosMeses, calcularAtividadesMes, calcularTotalHoras } from "@/lib/utils-pioneiro";
import { cn } from "@/lib/utils";
