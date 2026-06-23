"""
URL configuration for backend project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/4.2/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path, include, re_path
from django.views.generic import TemplateView
from django.views.static import serve
from django.conf import settings
from django.conf.urls.static import static

FRONTEND_BUILD_DIR = settings.BASE_DIR.parent / 'frontend' / 'build'

# Serve React build's index.html at root for development
urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/v1/", include("tasks.urls")),
    re_path(r'^manifest\.json$', serve, {"path": 'manifest.json', "document_root": FRONTEND_BUILD_DIR}),
    re_path(r'^favicon\.ico$', serve, {"path": 'favicon.ico', "document_root": FRONTEND_BUILD_DIR}),
]

# Static files for the React build and Django assets
urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)

# Check if frontend build exists, otherwise serve API status at root
if (FRONTEND_BUILD_DIR / 'index.html').exists():
    urlpatterns += [
        re_path(r'^.*$', TemplateView.as_view(template_name='index.html')),
    ]
else:
    from django.http import JsonResponse
    def api_root(request):
        return JsonResponse({
            "status": "online",
            "message": "TaskFlow API is running",
            "api_root": "/api/v1/"
        })
    urlpatterns += [
        path("", api_root),
    ]

