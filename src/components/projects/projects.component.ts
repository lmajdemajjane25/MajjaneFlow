
import { Component, ChangeDetectionStrategy, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface Project {
  id: number;
  name: string;
  client: string;
  type: string;
  status: 'En Cours' | 'Planification' | 'Terminé' | 'En Attente' | 'Annulé';
  priority: 'Haute' | 'Moyenne' | 'Basse';
  completion_percentage: number;
  budget: number;
  spent: number;
}

@Component({
  selector: 'app-projects',
  imports: [CommonModule],
  templateUrl: './projects.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProjectsComponent {

  private initialProjects: Project[] = [
    { id: 1, name: 'Refonte du site Web', client: 'Innovate Corp', type: 'Développement Web', status: 'En Cours', priority: 'Haute', completion_percentage: 75, budget: 15000, spent: 11250 },
    { id: 2, name: 'Campagne Marketing T3', client: 'Quantum Solutions', type: 'Marketing', status: 'Planification', priority: 'Moyenne', completion_percentage: 10, budget: 25000, spent: 2000 },
    { id: 3, name: 'SEO E-commerce', client: 'Stellar Goods', type: 'SEO', status: 'Terminé', priority: 'Haute', completion_percentage: 100, budget: 8000, spent: 7800 },
    { id: 4, name: 'Développement CRM Interne', client: 'Apex Industries', type: 'Développement Logiciel', status: 'En Attente', priority: 'Basse', completion_percentage: 40, budget: 30000, spent: 12000 },
  ];
  projects = signal<Project[]>(this.initialProjects);
  
  showProjectForm = signal(false);
  editingProject = signal<Project | null>(null);
  currentProject = signal<Project>(this.createEmptyProject());

  private createEmptyProject(): Project {
    const nextId = this.projects().length > 0 ? Math.max(...this.projects().map(p => p.id)) + 1 : 1;
    return {
      id: nextId,
      name: '',
      client: '',
      type: '',
      status: 'Planification',
      priority: 'Moyenne',
      completion_percentage: 0,
      budget: 0,
      spent: 0
    };
  }

  addProject() {
    this.editingProject.set(null);
    this.currentProject.set(this.createEmptyProject());
    this.showProjectForm.set(true);
  }

  editProject(project: Project) {
    this.editingProject.set(project);
    this.currentProject.set(JSON.parse(JSON.stringify(project)));
    this.showProjectForm.set(true);
  }

  deleteProject(projectId: number) {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce projet ?')) {
      this.projects.update(projects => projects.filter(p => p.id !== projectId));
    }
  }

  saveProject() {
    if (this.editingProject()) {
      this.projects.update(projects => 
        projects.map(p => p.id === this.editingProject()!.id ? this.currentProject() : p)
      );
    } else {
      this.projects.update(projects => [...projects, this.currentProject()]);
    }
    this.cancelProjectForm();
  }

  cancelProjectForm() {
    this.showProjectForm.set(false);
    this.editingProject.set(null);
  }

  updateCurrentProjectField(field: keyof Project, event: Event) {
    const target = event.target as HTMLInputElement | HTMLSelectElement;
    const value = target.value;
    this.currentProject.update(p => {
        const updatedProject = { ...p };
        const numericFields = ['completion_percentage', 'budget', 'spent'];
        if (numericFields.includes(field)) {
            (updatedProject as any)[field] = +value;
        } else {
            (updatedProject as any)[field] = value;
        }
        return updatedProject;
    });
  }
}