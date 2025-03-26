from rest_framework import viewsets
from ..serializers import HistorySerializer
from ..models import History

class HistoryViewSet(viewsets.ModelViewSet):
    queryset = History.objects.all()
    serializer_class = HistorySerializer