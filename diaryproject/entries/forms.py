from django import forms
from .models import Entry

class EntryForm(forms.ModelForm):
    class Meta:
        model = Entry
        fields = ['title', 'content']
        labels = {
            'title': 'Subject',
            'content': 'Write your content here',
        }
        widgets = {
            'title': forms.TextInput(attrs={
                'placeholder': 'Title your day...',
                'class': 'input',
            }),
            'content': forms.Textarea(attrs={
                'placeholder': "What's on your mind?",
                'class': 'textarea',
            }),
        }

    def clean_content(self):
        content = self.cleaned_data.get("content")
        return content.strip() if content else content